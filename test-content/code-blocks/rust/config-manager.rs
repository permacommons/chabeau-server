use serde::{Deserialize, Serialize};
use std::fs;

#[derive(Serialize, Deserialize, Debug)]
struct Config {
    name: String,
    version: String,
    features: Vec<String>,
}

fn load_config(path: &str) -> Result<Config, Box<dyn std::error::Error>> {
    let contents = fs::read_to_string(path)?;
    let config: Config = serde_json::from_str(&contents)?;
    Ok(config)
}

fn save_config(config: &Config, path: &str) -> Result<(), Box<dyn std::error::Error>> {
    let json = serde_json::to_string_pretty(config)?;
    fs::write(path, json)?;
    Ok(())
}

fn main() -> Result<(), Box<dyn std::error::Error>> {
    let config = Config {
        name: "MyApp".to_string(),
        version: "1.0.0".to_string(),
        features: vec!["feature1".to_string(), "feature2".to_string()],
    };
    
    save_config(&config, "config.json")?;
    let loaded_config = load_config("config.json")?;
    println!("{:#?}", loaded_config);
    
    Ok(())
}