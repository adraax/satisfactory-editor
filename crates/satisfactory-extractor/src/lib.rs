use regex::Regex;
use serde::{Deserialize, Deserializer, Serialize};
use serde_json::Value;
use std::{
    collections::HashMap,
    error::Error,
    fmt,
    fs::{read_to_string, File},
    io::BufWriter,
    path::PathBuf,
    sync::OnceLock,
};

struct RecipeBuildingParseError;

impl fmt::Display for RecipeBuildingParseError {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        write!(f, "An Error Occurred, Please Try Again!")
    }
}

impl fmt::Debug for RecipeBuildingParseError {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        write!(f, "{{ file: {}, line: {} }}", file!(), line!())
    }
}

const RECIPES: [&str; 1] = ["/Script/CoreUObject.Class'/Script/FactoryGame.FGRecipe'"];

const BUILDINGS: [&str; 2] = [
    "/Script/CoreUObject.Class'/Script/FactoryGame.FGBuildableManufacturer'",
    "/Script/CoreUObject.Class'/Script/FactoryGame.FGBuildableManufacturerVariablePower'",
];

const ITEMS: [&str; 11] = [
    "/Script/CoreUObject.Class'/Script/FactoryGame.FGItemDescriptor'",
    "/Script/CoreUObject.Class'/Script/FactoryGame.FGResourceDescriptor'",
    "/Script/CoreUObject.Class'/Script/FactoryGame.FGItemDescriptorBiomass'",
    "/Script/CoreUObject.Class'/Script/FactoryGame.FGConsumableDescriptor'",
    "/Script/CoreUObject.Class'/Script/FactoryGame.FGItemDescriptorNuclearFuel'",
    "/Script/CoreUObject.Class'/Script/FactoryGame.FGEquipmentDescriptor'",
    "/Script/CoreUObject.Class'/Script/FactoryGame.FGAmmoTypeProjectile'",
    "/Script/CoreUObject.Class'/Script/FactoryGame.FGAmmoTypeInstantHit'",
    "/Script/CoreUObject.Class'/Script/FactoryGame.FGAmmoTypeSpreadshot'",
    "/Script/CoreUObject.Class'/Script/FactoryGame.FGPowerShardDescriptor'",
    "/Script/CoreUObject.Class'/Script/FactoryGame.FGItemDescriptorPowerBoosterFuel'",
];

#[derive(Serialize, Deserialize)]
struct InRootType {
    #[serde(alias = "NativeClass")]
    native_class: String,
    #[serde(alias = "Classes")]
    classes: Vec<Value>,
}

#[derive(Serialize, Deserialize)]
enum ItemState {
    #[serde(rename(deserialize = "RF_SOLID"))]
    Solid,
    #[serde(rename(deserialize = "RF_LIQUID"))]
    Liquid,
    #[serde(rename(deserialize = "RF_GAS"))]
    Gas,
}

#[derive(Serialize, Deserialize)]
struct InItem {
    #[serde(alias = "mDisplayName")]
    name: String,
    #[serde(alias = "mSmallIcon")]
    icon: String,
    #[serde(alias = "mForm")]
    state: ItemState,
}

type InItems = HashMap<String, InItem>;

#[derive(Serialize, Deserialize)]
struct OutRecipe {
    name: String,
    alternate: bool,
    time: f32,
    building: String,
    inputs: Vec<Part>,
    outputs: Vec<Part>
}

#[derive(Serialize, Deserialize)]
struct Part {
    name: String,
    quantity: f32
}

type OutRecipes = HashMap<String, OutRecipe>;

#[derive(Serialize, Deserialize, Clone)]
struct OutBuilding {
    #[serde(alias = "mDisplayName")]
    name: String,
    #[serde(
        alias = "mPowerConsumption",
        deserialize_with = "deserialize_f32_string"
    )]
    power: f32,
    #[serde(
        alias = "mEstimatedMininumPowerConsumption",
        deserialize_with = "deserialize_option_f32_string",
        skip_serializing_if = "Option::is_none",
        default
    )]
    min_power: Option<f32>,
    #[serde(
        alias = "mEstimatedMaximumPowerConsumption",
        deserialize_with = "deserialize_option_f32_string",
        skip_serializing_if = "Option::is_none",
        default
    )]
    max_power: Option<f32>,
    #[serde(alias = "mProductionShardBoostMultiplier", default)]
    somersloop_mult: f32,
}

#[derive(Serialize, Deserialize)]
struct OutRootType {
    buildings: Vec<OutBuilding>,
    recipes: Vec<OutRecipe>,
}

type OutBuildings = HashMap<String, OutBuilding>;

fn deserialize_option_f32_string<'de, D>(deserializer: D) -> Result<Option<f32>, D::Error>
where
    D: Deserializer<'de>,
{
    Option::<String>::deserialize(deserializer)
        .map(|s| s.map(|s| s.parse::<f32>()).map(|f| f.unwrap()))
}

fn deserialize_f32_string<'de, D>(deserializer: D) -> Result<f32, D::Error>
where
    D: Deserializer<'de>,
{
    String::deserialize(deserializer).map(|s| s.parse::<f32>().unwrap())
}

fn get_classes(json: &mut [InRootType], keys: &[&str]) -> Vec<Value> {
    let mut output: Vec<Value> = vec![];

    for element in json.iter_mut() {
        if keys.contains(&element.native_class.as_str()) {
            output.append(&mut element.classes);
        }
    }

    output
}

fn get_building(
    recipe: &Value,
    buildings: &OutBuildings,
) -> Result<Option<OutBuilding>, RecipeBuildingParseError> {
    static REGEX: OnceLock<Regex> = OnceLock::new();
    let re = REGEX.get_or_init(|| Regex::new(r#"\"(?:.*?\.)(.*?)\""#).unwrap());
    let match_buildings: Vec<&str> = re
        .captures_iter(recipe["mProducedIn"].as_str().unwrap())
        .filter_map(|c| {
            let (_, [m]) = c.extract();
            match m {
                m if !m.contains("Workshop") && !m.contains("WorkBench") => Some(m),
                _ => None,
            }
        })
        .collect();

    match match_buildings.len() {
        0 => Ok(None),
        l if l > 1 => Err(RecipeBuildingParseError),
        _ => match buildings.get(match_buildings.first().unwrap().to_owned()) {
            Some(b) => Ok(Some(b.clone())),
            None => Ok(None),
        },
    }
}

fn parse_items_list(s: &str, items: &InItems) -> Vec<Part> {
    static REGEX: OnceLock<Regex> = OnceLock::new();
    let re = REGEX.get_or_init(|| Regex::new(r#"\(ItemClass=.*?\.([^.]*)\"',Amount=([0-9.]+)\)"#).unwrap());
    let match_items: Vec<Part> = re.captures_iter(s).filter_map(|c| {
        let (_, [i, q]) = c.extract();
        match i {
            i if items.contains_key(i) => Some(Part {
                name: items.get(i).unwrap().name.clone(),
                quantity: q.parse::<f32>().unwrap() / (match items.get(i).unwrap().state {
                    ItemState::Solid => 1.0f32,
                    ItemState::Gas => 1000.0f32,
                    ItemState::Liquid => 1000.0f32
                })
            }),
            _ => {
                println!("Unknown item {i}");
                None
            }
        }
    }).collect();
    match_items
}

pub fn parse_docs(input_path: PathBuf, output_path: PathBuf) -> Result<(), Box<dyn Error>> {
    let rdr = read_to_string(input_path)?;
    let mut docs: Vec<InRootType> = serde_json::from_str(&rdr)?;

    let buildings = get_classes(&mut docs, &BUILDINGS);
    let mut buildings_map: OutBuildings = HashMap::new();

    for b in buildings.iter() {
        buildings_map.insert(
            b["ClassName"].as_str().unwrap().to_owned(),
            serde_json::from_value(b.to_owned()).unwrap(),
        );
    }

    let items = get_classes(&mut docs, &ITEMS);
    let mut items_map: InItems = HashMap::new();

    for i in items.iter() {
        items_map.insert(
            i["ClassName"].as_str().unwrap().to_owned(),
            serde_json::from_value(i.to_owned()).unwrap(),
        );
    }

    let recipes = get_classes(&mut docs, &RECIPES);
    let mut recipes_map: OutRecipes = HashMap::new();

    for r in recipes.iter() {
        if r["mProducedIn"].as_str().unwrap() == ""
            || r["mProducedIn"].as_str().unwrap().contains("BuildGun")
            || r["mRelevantEvents"].as_str().unwrap() != ""
            || r["FullName"].as_str().unwrap().contains("Fireworks")
        {
            continue;
        }

        let building = get_building(r, &buildings_map).unwrap();

        if building.is_none() {
            continue;
        }

        recipes_map.insert(
            r["ClassName"].as_str().unwrap().to_owned(),
            OutRecipe {
                name: r["mDisplayName"]
                    .as_str()
                    .unwrap()
                    .replace("Alternate:", "")
                    .trim()
                    .to_owned(),
                alternate: r["mDisplayName"].as_str().unwrap().contains("Alternate"),
                time: r["mManufactoringDuration"]
                    .as_str()
                    .unwrap()
                    .parse()
                    .unwrap(),
                building: building.unwrap().name,
                inputs: parse_items_list(r["mIngredients"].as_str().unwrap(), &items_map),
                outputs: parse_items_list(r["mProduct"].as_str().unwrap(), &items_map)
            },
        );
    }

    let mut outb: Vec<OutBuilding> = buildings_map.into_values().collect();
    outb.sort_unstable_by(|a, b| a.name.cmp(&b.name));

    let mut outr: Vec<OutRecipe> = recipes_map.into_values().collect();
    outr.sort_unstable_by(|a, r| a.name.cmp(&r.name));
    let out: OutRootType = OutRootType {
        buildings: outb,
        recipes: outr,
    };

    let out_file = File::options()
        .create(true)
        .write(true)
        .append(false)
        .truncate(true)
        .open(output_path)
        .expect("failed to open output");
    let writer = BufWriter::new(out_file);
    serde_json::to_writer_pretty(writer, &out).unwrap();
    Ok(())
}
