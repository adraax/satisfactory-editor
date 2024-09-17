fn main() {
    #[cfg(not(debug_assertions))]
    {
        use std::path::PathBuf;

        let root_path = PathBuf::from(std::env::var("CARGO_WORKSPACE_DIR").unwrap());
        let extractor_path = root_path.join("crates").join("satisfactory-extractor").join("src").join("lib.rs");
        
        let input_path = root_path.join("src-tauri").join("assets").join("Docs.json");
        let output_path = root_path
            .join("dist")
            .join("satisfactory-editor")
            .join("browser")
            .join("assets")
            .join("data.json");
        satisfactory_extractor::parse_docs(input_path, output_path).unwrap();
        println!("cargo::rerun-if-changed={}", extractor_path.to_str().unwrap());
    }
    tauri_build::build()
}
