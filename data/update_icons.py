import json
import os

def load_json(file_path):
    try:
        with open(file_path, 'r') as file:
            return json.load(file)
    except FileNotFoundError:
        print(f"Error: The file {file_path} was not found.")
        return None
    except json.JSONDecodeError:
        print(f"Error: The file {file_path} is not a valid JSON file.")
        return None
    except Exception as e:
        print(f"An unexpected error occurred while reading the file: {str(e)}")
        return None

def save_json(data, file_path):
    try:
        with open(file_path, 'w') as file:
            json.dump(data, file, indent=2)
        print(f"JSON saved to {file_path}")
    except Exception as e:
        print(f"An error occurred while saving the file: {str(e)}")

def update_icon_uris(file_path):
    data = load_json(file_path)
    if data is None:
        return

    output_file = 'isaac_v2_updated.json'
    
    # Check if output file already exists
    if os.path.exists(output_file):
        overwrite = input(f"{output_file} already exists. Do you want to overwrite it? (y/n): ").lower()
        if overwrite != 'y':
            print("Operation cancelled.")
            return

    # Iterate through each character
    for i, character in enumerate(data['characters']):
        name = character['name']
        print(f"Current icon URI for {name}: {character.get('characterIconUri', 'None')}")
        
        while True:
            new_uri = input(f"Enter new URI for {name} (or press Enter to skip): ").strip()

            if not new_uri:
                break  # Skip this character if no input

            # Ensure the URI ends with .png
            if '.png' not in new_uri:
                new_uri += '.png'
            else:
                new_uri = new_uri.split('.png')[0] + '.png'

            confirm = input(f"Confirm new URI: {new_uri} (y/n): ").lower()
            if confirm == 'y':
                character['characterIconUri'] = new_uri
                break
            else:
                print("URI not confirmed. Please try again.")

        # Save after each update
        save_json(data, output_file)
        print(f"Progress saved. Processed {i+1}/{len(data['characters'])} characters.")

    print("All characters processed. Final JSON saved to", output_file)

# Run the function
if __name__ == "__main__":
    update_icon_uris('isaac_v2.json')