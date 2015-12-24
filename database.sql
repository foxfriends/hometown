/*
    Initial database structure. Using PostgreSQL
        [User Data]
            accounts
            players
            friends
            towns
            player_town
            residences
        [Neighbour Data]
            neighbours
            personalities
            neighbour_personality
        [Item Data]
            items
            types
            item_type
            sets
            furniture_data
            (furnitures)
            furniture_set
            food_data
            (foods)
            tree_data
            (trees)
            bush_data
            (bushes)
            flower_data
            (flowers)
            flower_cross
            seed_data
            (seeds)
            clothing_data
            (clothes)
            clothing_set
            tool_data
            (tools)
            fish_data
            (fish)
            bug_data
            (bugs)
            dinosaurs
            fossil_data
            (fossils)
            artwork_data
            (artworks)
            cd_data
            (cds)
        [Building Data]
            buildings
            public_works
*/

-------------------------------- Database Setup --------------------------------

CREATE DATABASE hometown;

CREATE ROLE hometown WITH LOGIN PASSWORD 'htisthenewac';

REVOKE CONNECT ON DATABASE hometown FROM PUBLIC;
GRANT ALL PRIVILEGES ON DATABASE hometown TO hometown;

\c hometown;
SET ROLE hometown;

---------------------------------- User Data -----------------------------------

-- Personal data not used in game
CREATE TABLE accounts (
    user_id SERIAL PRIMARY KEY,
    username VARCHAR(512) UNIQUE NOT NULL,
    password VARCHAR(512) NOT NULL,
    salt VARCHAR(512) NOT NULL, 
    email VARCHAR(512) UNIQUE NOT NULL,
    join_date TIMESTAMP NOT NULL DEFAULT (NOW()::TIMESTAMP)
);
CREATE INDEX accounts_user_index ON accounts (user_id);
CREATE INDEX accounts_username_index ON accounts (username);

-- Character data used in game
CREATE TABLE players (
    user_id INT UNIQUE NOT NULL REFERENCES accounts(user_id) ON DELETE CASCADE,
    name VARCHAR(32) NOT NULL,
    player_data JSON NOT NULL
);
CREATE INDEX players_user_index ON players (user_id);

-- Connect friends to be notified of their online status
CREATE TABLE friends (
    user_a INT NOT NULL REFERENCES accounts (user_id) ON DELETE CASCADE,
    user_b INT NOT NULL REFERENCES accounts (user_id) ON DELETE CASCADE,
    CONSTRAINT cannot_befriend_yourself CHECK (user_a <> user_b) -- No self-friending
);
CREATE INDEX friends_user_a_index ON friends (user_a);
CREATE INDEX friends_user_b_index ON friends (user_b);

-- Town data
CREATE TABLE towns (
    town_id SERIAL PRIMARY KEY,
    name VARCHAR(32) NOT NULL,
    description VARCHAR(512) NOT NULL,
    creation_date TIMESTAMP NOT NULL DEFAULT (NOW()::TIMESTAMP),
    last_save TIMESTAMP NOT NULL DEFAULT (NOW()::TIMESTAMP)
);
CREATE INDEX towns_town_index ON towns (town_id);

-- Link towns to their founders
CREATE TABLE player_town (
    user_id INT UNIQUE NOT NULL REFERENCES players (user_id) ON DELETE CASCADE,
    town_id INT UNIQUE NOT NULL REFERENCES towns (town_id) ON DELETE CASCADE
);
CREATE INDEX player_town_user_index ON player_town (user_id);
CREATE INDEX player_town_town_index ON player_town (town_id);

-- Delete towns if player gets deleted, or resigns as mayor.
CREATE RULE delete_town_on_resign AS
    ON DELETE TO player_town DO
        DELETE FROM towns WHERE town_id = OLD.town_id;

-- Towns where the player owns a house
CREATE TABLE residences (
    user_id INT NOT NULL REFERENCES players (user_id) ON DELETE CASCADE,
    town_id INT NOT NULL REFERENCES towns (town_id) ON DELETE CASCADE,
    -- The house to load the game from
    primary_home BOOLEAN NOT NULL
);
CREATE INDEX residences_user_index ON residences (user_id);

-- Each player can only have one primary home
CREATE RULE one_primary_residence AS
    ON UPDATE TO residences WHERE NEW.primary_home = TRUE DO
        UPDATE residences SET primary_home = FALSE
            WHERE   user_id = NEW.user_id AND
                    town_id <> NEW.town_id AND
                    primary_home = TRUE;

-------------------------------- Neighbour Data --------------------------------

-- Each NPC neighbour and their information
CREATE TABLE neighbours (
    neighbour_id SERIAL PRIMARY KEY,
    name VARCHAR(32) UNIQUE NOT NULL,
    defaults JSON NOT NULL
);
CREATE INDEX neighbours_neighbour_index ON neighbours (neighbour_id);

-- Types of neighbours
CREATE TABLE personalities (
    personality_id SERIAL PRIMARY KEY,
    name VARCHAR(32) UNIQUE NOT NULL,
    description VARCHAR(512) NOT NULL
);
CREATE INDEX personalities_personality_index ON personalities (personality_id);

-- Link neighbours to their personalities
CREATE TABLE neighbour_personality (
    neighbour_id INT UNIQUE NOT NULL REFERENCES neighbours (neighbour_id) ON DELETE CASCADE,
    personality_id INT NOT NULL REFERENCES personalities (personality_id) ON DELETE CASCADE
);
CREATE INDEX neighbour_personality_neighbour_index ON neighbour_personality (neighbour_id);

---------------------------- Items and Object Data -----------------------------

-- All items
CREATE TABLE items (
    item_id SERIAL PRIMARY KEY,
    name VARCHAR(32) NOT NULL,
    description VARCHAR(512) NOT NULL,
    price INT NOT NULL CONSTRAINT must_cost_something CHECK (price > 0),
    creator_id INT REFERENCES accounts (user_id) ON DELETE SET NULL
);
CREATE INDEX items_item_index ON items (item_id);

-- Types of items
CREATE TABLE types (
    type_id SERIAL PRIMARY KEY,
    name VARCHAR(32) NOT NULL,
    description VARCHAR(512) NOT NULL
);
CREATE INDEX types_type_index ON types (type_id);
CREATE INDEX types_name_index ON types (name);

-- Some types
INSERT INTO types (name, description) VALUES ('Furniture', 'A piece of furniture to decorate your house or the town with. Place it inside or outside.');
INSERT INTO types (name, description) VALUES ('Food', 'Eat this, or give it as a gift to your neighbours. Everyone likes food.');
INSERT INTO types (name, description) VALUES ('Tree', 'Plant this sapling and it will grow into a full tree in only a few days!');
INSERT INTO types (name, description) VALUES ('Bush', 'Plant this sapling and it will grow into a bush in a few days.');
INSERT INTO types (name, description) VALUES ('Flower', 'A pretty flower. Give it to someone special or replant it somewhere else.');
INSERT INTO types (name, description) VALUES ('Seed', 'Plant this seed and it will immediately grow into a flower!');
INSERT INTO types (name, description) VALUES ('Clothing', 'Put this on and show off your style. Or hang it up in your closet back home.');
INSERT INTO types (name, description) VALUES ('Tool', 'Hold onto this and you can use it for something. Store it in the toolbox when you''re done.');
INSERT INTO types (name, description) VALUES ('Fish', 'A fish caught from the waters around town. Keep it as a pet or put it back.');
INSERT INTO types (name, description) VALUES ('Bug', 'A bug found around town. Keep it as a pet or set it free again.');
INSERT INTO types (name, description) VALUES ('Fossil', 'Something from the past. It''s probably even older than your parents');
INSERT INTO types (name, description) VALUES ('Artwork', 'A beautiful piece of art. Whoever made it was very talented.');
INSERT INTO types (name, description) VALUES ('CD', 'Listen to this with your CD player back home!');
INSERT INTO types (name, description) VALUES ('Misc.', '');

-- Link items with their types
CREATE TABLE item_type (
    item_id INT UNIQUE NOT NULL REFERENCES items (item_id) ON DELETE CASCADE,
    type_id INT NOT NULL REFERENCES types (type_id) ON DELETE CASCADE
);
CREATE INDEX item_type_item_index ON item_type (item_id);

-- Possible styles of furniture/clothing
CREATE TABLE styles (
    style_id SERIAL PRIMARY KEY,
    name VARCHAR(32) NOT NULL
);
CREATE INDEX styles_style_index ON styles (style_id);

INSERT INTO styles (name) VALUES ('Simple');
INSERT INTO styles (name) VALUES ('Traditional');
INSERT INTO styles (name) VALUES ('Cute');
INSERT INTO styles (name) VALUES ('Formal');
INSERT INTO styles (name) VALUES ('Sexy');
INSERT INTO styles (name) VALUES ('Athletic');
INSERT INTO styles (name) VALUES ('Trendy');
INSERT INTO styles (name) VALUES ('Cheap');
INSERT INTO styles (name) VALUES ('Uniform');
INSERT INTO styles (name) VALUES ('Seasonal');
INSERT INTO styles (name) VALUES ('Historical');
INSERT INTO styles (name) VALUES ('Modern');
INSERT INTO styles (name) VALUES ('Tropical');
INSERT INTO styles (name) VALUES ('Sci-fi');

-- Grouping furniture/clothing together by creator and style
CREATE TABLE sets (
    set_id SERIAL PRIMARY KEY,
    name VARCHAR(32) UNIQUE NOT NULL,
    description VARCHAR(512) NOT NULL,
    style INT NOT NULL REFERENCES styles (style_id) ON DELETE RESTRICT,
    creation_date TIMESTAMP NOT NULL DEFAULT (NOW()::TIMESTAMP),
    creator_id INT REFERENCES accounts (user_id) ON DELETE SET NULL
);
CREATE INDEX sets_set_index ON sets (set_id);
CREATE INDEX sets_name_index ON sets (name);

-- Possible furniture types
CREATE TABLE furniture_types (
    furniture_type_id SERIAL PRIMARY KEY,
    name VARCHAR(32)
);
INSERT INTO furniture_types (name) VALUES ('Bed');
INSERT INTO furniture_types (name) VALUES ('Armchair');
INSERT INTO furniture_types (name) VALUES ('Chair');
INSERT INTO furniture_types (name) VALUES ('Stool');
INSERT INTO furniture_types (name) VALUES ('Decoration');
INSERT INTO furniture_types (name) VALUES ('Object');
INSERT INTO furniture_types (name) VALUES ('Wall Decoration');
INSERT INTO furniture_types (name) VALUES ('Rug');
INSERT INTO furniture_types (name) VALUES ('Table');
INSERT INTO furniture_types (name) VALUES ('Cabinet');
INSERT INTO furniture_types (name) VALUES ('CD Player');
INSERT INTO furniture_types (name) VALUES ('Mannequin');
INSERT INTO furniture_types (name) VALUES ('Arch');

-- Data for furniture
CREATE TABLE furniture_data (
    furniture_id SERIAL PRIMARY KEY,
    item_id INT UNIQUE NOT NULL REFERENCES items (item_id) ON DELETE CASCADE,
    type INT NOT NULL REFERENCES furniture_types (furniture_type_id) ON DELETE RESTRICT,
    dimensions POINT NOT NULL CONSTRAINT must_take_up_space CHECK (dimensions[0] > 0 AND dimensions[1] > 0)
);
CREATE INDEX furniture_data_furniture_index ON furniture_data (furniture_id);
CREATE INDEX furniture_data_item_index ON furniture_data (item_id);

-- View items with furniture_data
CREATE VIEW furnitures AS
    SELECT * FROM items JOIN furniture_data USING (item_id);

-- Link the furniture to the set its in
CREATE TABLE furniture_set (
    item_id INT UNIQUE NOT NULL REFERENCES furniture_data (furniture_id) ON DELETE CASCADE,
    set_id INT NOT NULL REFERENCES sets (set_id) ON DELETE CASCADE
);
CREATE INDEX furniture_set_item_index ON furniture_set (item_id);
CREATE INDEX furniture_set_set_index ON furniture_set (set_id);

-- Data for foods
CREATE TABLE food_data (
    food_id SERIAL PRIMARY KEY,
    item_id INT UNIQUE NOT NULL REFERENCES items (item_id) ON DELETE CASCADE
);
CREATE INDEX food_data_food_index ON food_data (food_id);
CREATE INDEX food_data_item_index ON food_data (item_id);

-- View items with food_data
CREATE VIEW foods AS
    SELECT * FROM items JOIN food_data USING (item_id);

-- Data for trees
CREATE TABLE tree_data (
    tree_id SERIAL PRIMARY KEY,
    item_id INT UNIQUE NOT NULL REFERENCES items (item_id) ON DELETE CASCADE,
    food_id INT REFERENCES food_data (food_id) ON DELETE SET NULL
);
CREATE INDEX tree_data_item_index ON tree_data (item_id);
CREATE INDEX tree_data_tree_index ON tree_data (tree_id);

-- View items with tree_data
CREATE VIEW trees AS
    SELECT * FROM items JOIN tree_data USING (item_id);

CREATE TABLE bush_data (
    bush_id SERIAL PRIMARY KEY,
    item_id INT UNIQUE NOT NULL REFERENCES items (item_id) ON DELETE CASCADE
);

-- View items that are bushes
CREATE VIEW bushes AS
    SELECT * FROM items JOIN bush_data USING (item_id);

-- Data for flowers
CREATE TABLE flower_data (
    flower_id SERIAL PRIMARY KEY,
    item_id INT UNIQUE NOT NULL REFERENCES items (item_id) ON DELETE CASCADE
);
CREATE INDEX flower_data_item_index ON flower_data (item_id);
CREATE INDEX flower_data_flower_index ON flower_data (flower_id);

-- View items with flower_data
CREATE VIEW flowers AS
    SELECT * FROM items JOIN flower_data USING (item_id);

-- Flower crossbreeding chart
CREATE TABLE flower_cross (
    flower_a INT NOT NULL REFERENCES flower_data (flower_id) ON DELETE CASCADE,
    flower_b INT NOT NULL REFERENCES flower_data (flower_id) ON DELETE CASCADE,
    flower_c INT NOT NULL REFERENCES flower_data (flower_id) ON DELETE CASCADE
);
CREATE INDEX flower_cross_a_index ON flower_cross (flower_a, flower_b);
CREATE INDEX flower_cross_b_index ON flower_cross (flower_b, flower_a);

-- Data for (flower) seeds
CREATE TABLE seed_data (
    seed_id SERIAL PRIMARY KEY,
    item_id INT UNIQUE NOT NULL REFERENCES items (item_id) ON DELETE CASCADE,
    flower_id INT UNIQUE NOT NULL REFERENCES flower_data (flower_id) ON DELETE CASCADE
);
CREATE INDEX seed_data_seed_index ON seed_data (seed_id);
CREATE INDEX seed_data_item_index ON seed_data (item_id);

CREATE VIEW seeds AS
    SELECT * FROM items JOIN seed_data USING (item_id);

-- Possible types of clothing
CREATE TYPE clothing_type AS ENUM (
    'Shirt', 'Pants', 'Shorts', 'Dress', 'Skirt',
    'Socks', 'Shoes', 'Hat', 'Glasses', 'Accessory',
    'Hand', 'Held'
);
-- Data for clothing
CREATE TABLE clothing_data (
    clothing_id SERIAL PRIMARY KEY,
    item_id INT UNIQUE NOT NULL REFERENCES items (item_id) ON DELETE CASCADE,
    type clothing_type NOT NULL,
    style INT NOT NULL REFERENCES styles (style_id) ON DELETE RESTRICT
);
CREATE INDEX clothing_data_clothing_index ON clothing_data (clothing_id);
CREATE INDEX clothing_data_item_index ON clothing_data (item_id);

-- View items with clothing_data
CREATE VIEW clothes AS
    SELECT * FROM items JOIN clothing_data USING (item_id);

-- Link clothing to the set its in
CREATE TABLE clothing_set (
    clothing_id INT UNIQUE NOT NULL REFERENCES clothing_data (clothing_id),
    set_id INT UNIQUE NOT NULL REFERENCES sets (set_id)
);

-- Possible types of tools
CREATE TYPE tool_type AS ENUM (
    'Shovel', 'Net', 'Fishing Rod', 'Slingshot', 'Watering Can', 'Axe',
    'Umbrella', 'Consumable', 'Decorative', 'Bag'
);
-- Data for tools
CREATE TABLE tool_data (
    tool_id SERIAL PRIMARY KEY,
    item_id INT UNIQUE NOT NULL REFERENCES items (item_id) ON DELETE CASCADE,
    purpose tool_type NOT NULL,
    durability INT NOT NULL DEFAULT (-1)
);
CREATE INDEX tool_data_tool_index ON tool_data (tool_id);

-- Data for held items (tools)
CREATE VIEW tools AS
    SELECT * FROM clothes JOIN tool_data USING (item_id);

-- Types of weather
CREATE TYPE weather_type AS ENUM (
    'Sunny', 'Cloudy', 'Foggy', 'Rainy', 'Stormy'
);

CREATE TABLE locations (
    location_id SERIAL PRIMARY KEY,
    name VARCHAR(32) NOT NULL
);

INSERT INTO locations (name) VALUES ('Grass');
INSERT INTO locations (name) VALUES ('Dirt');
INSERT INTO locations (name) VALUES ('Flower');
INSERT INTO locations (name) VALUES ('Tree');
INSERT INTO locations (name) VALUES ('Stump');
INSERT INTO locations (name) VALUES ('Rock');
INSERT INTO locations (name) VALUES ('Bush');
INSERT INTO locations (name) VALUES ('Light');
INSERT INTO locations (name) VALUES ('Underground');
INSERT INTO locations (name) VALUES ('Sky');
INSERT INTO locations (name) VALUES ('Beach');
INSERT INTO locations (name) VALUES ('River');
INSERT INTO locations (name) VALUES ('Sea');
INSERT INTO locations (name) VALUES ('Pond');
INSERT INTO locations (name) VALUES ('Lake');
INSERT INTO locations (name) VALUES ('Waterfall');

-- Possible shapes of fish
CREATE TYPE fish_shape_type AS ENUM (
    'Regular', 'Thin', 'Shark'
);
-- Data for fish
CREATE TABLE fish_data (
    fish_id SERIAL PRIMARY KEY,
    item_id INT UNIQUE NOT NULL REFERENCES items (item_id) ON DELETE CASCADE,
    rarity SMALLINT NOT NULL CONSTRAINT must_actually_exist CHECK (rarity > 0),
    months BOOLEAN ARRAY[12] NOT NULL DEFAULT (ARRAY_FILL(TRUE, ARRAY[12])),
    hours BOOLEAN ARRAY[24] NOT NULL DEFAULT (ARRAY_FILL(TRUE, ARRAY[24])),
    location INT NOT NULL REFERENCES locations (location_id),
    size_range NUMRANGE NOT NULL CONSTRAINT bigger_than_nothing CHECK (LOWER(size_range) > 0),
    shape fish_shape_type NOT NULL DEFAULT ('Regular'),
    weather weather_type -- Null for any weather
);
CREATE INDEX fish_data_fish_index ON fish_data (fish_id);
CREATE INDEX fish_data_item_index ON fish_data (item_id);

-- View items with fish_data
CREATE VIEW fish AS
    SELECT * FROM items JOIN fish_data USING (item_id);

-- Data for bugs
CREATE TABLE bug_data (
    bug_id SERIAL PRIMARY KEY,
    item_id INT UNIQUE NOT NULL REFERENCES items (item_id) ON DELETE CASCADE,
    rarity SMALLINT NOT NULL CONSTRAINT must_actually_exist CHECK (rarity > 0),
    months BOOLEAN ARRAY[12] NOT NULL DEFAULT (ARRAY_FILL(TRUE, ARRAY[12])),
    hours BOOLEAN ARRAY[24] NOT NULL DEFAULT (ARRAY_FILL(TRUE, ARRAY[24])),
    location INT NOT NULL REFERENCES locations (location_id) ON DELETE RESTRICT,
    size_range NUMRANGE NOT NULL CONSTRAINT bigger_than_nothing CHECK (LOWER(size_range) > 0),
    weather weather_type -- Null for any weather
);
CREATE INDEX bug_data_bug_index ON bug_data (bug_id);
CREATE INDEX bug_data_item_index ON bug_data (item_id);

-- View items with bug_data
CREATE VIEW bugs AS
    SELECT * FROM items JOIN bug_data USING (item_id);

-- Data for dinosaurs (fossil structures)
CREATE TABLE dinosaurs (
    dinosaur_id SERIAL PRIMARY KEY,
    name VARCHAR(32) UNIQUE NOT NULL,
    description VARCHAR(512) NOT NULL,
    pieces SMALLINT NOT NULL CONSTRAINT made_of_pieces CHECK (pieces > 0)
);
CREATE INDEX dinosaurs_dinosaur_index ON dinosaurs (dinosaur_id);
CREATE INDEX dinosaurs_name_index ON dinosaurs (name);

-- Data for fossils
CREATE TABLE fossil_data (
    fossil_id SERIAL PRIMARY KEY,
    item_id INT UNIQUE NOT NULL REFERENCES items (item_id) ON DELETE CASCADE,
    dinosaur_id INT REFERENCES dinosaurs (dinosaur_id) ON DELETE SET NULL,
    piece_number INT CONSTRAINT piece_of_something CHECK ((dinosaur_id = NULL) = (piece_number = NULL))
);
CREATE INDEX fossil_data_fossil_index ON fossil_data (fossil_id);
CREATE INDEX fossil_data_item_index ON fossil_data (item_id);
CREATE INDEX fossil_data_dinosaur_index ON fossil_data (dinosaur_id);

-- If the dinosaur is removed, remove its piece number
CREATE RULE no_longer_pieces AS
    ON DELETE TO dinosaurs DO
        UPDATE fossil_data SET piece_number = NULL WHERE dinosaur_id = OLD.dinosaur_id;

-- View items with fossil_data
CREATE VIEW fossils AS
    SELECT * FROM items JOIN fossil_data USING (item_id);

-- Data for artwork
CREATE TABLE artwork_data (
    artwork_id SERIAL PRIMARY KEY,
    item_id INT UNIQUE NOT NULL REFERENCES items (item_id) ON DELETE CASCADE,
    forgery BOOLEAN NOT NULL DEFAULT (FALSE)
);
CREATE INDEX artwork_data_artwork_index ON artwork_data (artwork_id);
CREATE INDEX artwork_data_item_index ON artwork_data (item_id);

-- View items with artwork_data
CREATE VIEW artworks AS
    SELECT * FROM items JOIN artwork_data USING (item_id);

-- Data for CDs
CREATE TABLE cd_data (
    cd_id SERIAL PRIMARY KEY,
    item_id INT UNIQUE NOT NULL REFERENCES items (item_id) ON DELETE CASCADE
);
CREATE INDEX cd_data_cd_index ON cd_data (cd_id);
CREATE INDEX cd_data_item_index ON cd_data (item_id);

-- View items with cd_data
CREATE VIEW cds AS
    SELECT * FROM items JOIN cd_data USING (item_id);

-------------------------------- Building Data ---------------------------------

-- Buildings
CREATE TABLE buildings (
    building_id SERIAL PRIMARY KEY,
    name VARCHAR(32) NOT NULL,
    description VARCHAR(512) NOT NULL,
    dimensions POINT NOT NULL CONSTRAINT must_take_up_space CHECK (dimensions[0] > 0 AND dimensions[1] > 0),
    door POINT NOT NULL CONSTRAINT must_be_on_the_building CHECK (door[0] < dimensions[0] AND door[1] < dimensions[1])
);
CREATE INDEX buildings_building_index ON buildings (building_id);
CREATE INDEX buildings_name_index ON buildings (name);

-- Public works (outdoor, fixed furniture)
CREATE TABLE public_works (
    public_work_id SERIAL PRIMARY KEY,
    name VARCHAR(32) NOT NULL,
    description VARCHAR(512) NOT NULL,
    dimensions POINT NOT NULL CONSTRAINT must_take_up_space CHECK (dimensions[0] > 0 AND dimensions[1] > 0),
    type INT NOT NULL REFERENCES furniture_types (furniture_type_id) ON DELETE RESTRICT
);
CREATE INDEX public_works_public_work_index ON public_works (public_work_id);
CREATE INDEX public_works_name_index ON public_works (name);