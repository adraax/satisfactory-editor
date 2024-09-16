fn main() {
    #[cfg(not(debug_assertions))]
    {
        use std::env::current_dir;

        let input_path = current_dir().unwrap().join("assets").join("Docs.json");
        let output_path = current_dir()
            .unwrap()
            .join("..")
            .join("dist")
            .join("satisfactory-editor")
            .join("browser")
            .join("assets")
            .join("data.json");
        satisfactory_extractor::parse_docs(input_path, output_path).unwrap();
    }
    tauri_build::build()
}
