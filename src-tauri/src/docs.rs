use std::{collections::HashMap, env::current_dir, error::Error, fs::{read_to_string, File}, io::BufWriter};

use serde::{de::Visitor, Deserialize, Deserializer, Serialize};
use serde_json::Value;

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

#[derive(Serialize, Deserialize, Debug)]
struct InRootType {
    #[serde(alias = "NativeClass")]
    native_class: String,
    #[serde(alias = "Classes")]
    classes: Vec<Value>,
}

#[derive(Serialize, Deserialize, Debug)]
struct OutBuilding {
    #[serde(alias = "mDisplayName")]
    name: String,
    #[serde(alias = "mPowerConsumption", deserialize_with = "deserialize_f32_string")]
    power: f32,
    #[serde(alias = "mProductionShardBoostMultiplier", default)]
    somersloop_mult: f32
}

fn deserialize_f32_string<'de, D>(deserializer: D) -> Result<f32, D::Error> where D: Deserializer<'de> {
    struct StringVisitor;
    
    impl<'de> Visitor<'de> for StringVisitor {
        type Value = f32;

        fn expecting(&self, formatter: &mut std::fmt::Formatter) -> std::fmt::Result {
            formatter.write_str("a string containing a f32")
        }
        
        fn visit_str<E>(self, v: &str) -> Result<Self::Value, E>
        where
            E: serde::de::Error, {
                v.parse::<f32>().map_err(E::custom)
            }
    }
    
    deserializer.deserialize_any(StringVisitor)
}

#[derive(Serialize, Deserialize, Debug)]
struct OutRootType {
    buildings: OutBuildings
}

type OutBuildings = HashMap<String, OutBuilding>;

fn get_classes(json: &mut [InRootType], keys: &[&str]) -> OutBuildings {
    let mut output: OutBuildings = HashMap::new();
    
    for element in json.iter_mut() {
        if keys.contains(&element.native_class.as_str()) {
            for b in element.classes.clone() {
                output.insert(b["ClassName"].as_str().unwrap().to_owned(), serde_json::from_value(b).unwrap());
            }
        }
    }
    
    output
}

pub fn parse_docs() -> Result<(), Box<dyn Error>>{
    let mut path = current_dir()?;
    path = path.join("src-tauri").join("assets");
    let output_path = path.join("output.json");
    path = path.join("Docs.json");
    let rdr = read_to_string(path)?;
    let mut docs: Vec<InRootType> = serde_json::from_str(&rdr)?;
    
    let buildings = get_classes(&mut docs, &BUILDINGS);
    
    let out: OutRootType = OutRootType{buildings};
    
    let out_file = File::options().write(true).append(false).open(output_path).unwrap();
    let writer = BufWriter::new(out_file);
    serde_json::to_writer_pretty(writer, &out).unwrap();
    Ok(())
    
}