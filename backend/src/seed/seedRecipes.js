import mongoose from "mongoose";
import dotenv from "dotenv";
import Recipe from "../models/Recipe.model.js";

dotenv.config();

const recipes = [
  {
    name: "Tomato Basil Pasta",
    description: "Classic Italian pasta with fresh basil",
    cuisine_type: "Italian",
    difficulty: "easy",
    prep_time: 10,
    cook_time: 20,
    servings: 2,
    ingredients: [
      { name: "Pasta", quantity: 200, unit: "g" },
      { name: "Tomato", quantity: 3, unit: "pieces" },
      { name: "Basil", quantity: 1, unit: "cup" },
    ],
    instructions: ["Boil pasta", "Prepare sauce", "Mix together"],
    dietary_tags: ["Vegetarian"],
  },
  {
    name: "Paneer Butter Masala",
    description: "Creamy Indian paneer curry",
    cuisine_type: "Indian",
    difficulty: "medium",
    prep_time: 20,
    cook_time: 30,
    servings: 3,
    ingredients: [
      { name: "Paneer", quantity: 200, unit: "g" },
      { name: "Tomato", quantity: 3, unit: "pieces" },
    ],
    instructions: ["Prepare gravy", "Add paneer", "Cook well"],
    dietary_tags: ["Vegetarian"],
  },
  {
    name: "Vegetable Stir Fry",
    description: "Quick healthy vegetable stir fry",
    cuisine_type: "Asian",
    difficulty: "easy",
    prep_time: 15,
    cook_time: 10,
    servings: 2,
    ingredients: [
      { name: "Broccoli", quantity: 100, unit: "g" },
      { name: "Carrot", quantity: 1, unit: "pieces" },
    ],
    instructions: ["Chop veggies", "Stir fry", "Serve hot"],
    dietary_tags: ["Vegan"],
  },
  {
    name: "Grilled Chicken Salad",
    description: "Healthy protein-rich salad",
    cuisine_type: "Global",
    difficulty: "easy",
    prep_time: 15,
    cook_time: 15,
    servings: 2,
    ingredients: [
      { name: "Chicken Breast", quantity: 200, unit: "g" },
      { name: "Lettuce", quantity: 1, unit: "cup" },
    ],
    instructions: ["Grill chicken", "Mix with salad"],
    dietary_tags: ["High-Protein"],
  },
  {
    name: "Masala Omelette",
    description: "Indian-style omelette",
    cuisine_type: "Indian",
    difficulty: "easy",
    prep_time: 5,
    cook_time: 5,
    servings: 1,
    ingredients: [
      { name: "Eggs", quantity: 2, unit: "pieces" },
      { name: "Onion", quantity: 1, unit: "pieces" },
    ],
    instructions: ["Beat eggs", "Cook with spices"],
    dietary_tags: [],
  },
  {
    name: "Quinoa Salad",
    description: "Healthy quinoa salad",
    cuisine_type: "Mediterranean",
    difficulty: "easy",
    prep_time: 10,
    cook_time: 15,
    servings: 2,
    ingredients: [
      { name: "Quinoa", quantity: 100, unit: "g" },
      { name: "Cucumber", quantity: 1, unit: "pieces" },
    ],
    instructions: ["Cook quinoa", "Mix veggies"],
    dietary_tags: ["Gluten-Free"],
  },
  {
    name: "Chicken Curry",
    description: "Spicy Indian chicken curry",
    cuisine_type: "Indian",
    difficulty: "medium",
    prep_time: 20,
    cook_time: 30,
    servings: 3,
    ingredients: [
      { name: "Chicken", quantity: 300, unit: "g" },
      { name: "Spices", quantity: 2, unit: "tbsp" },
    ],
    instructions: ["Cook chicken", "Add spices"],
    dietary_tags: [],
  },
  {
    name: "Veg Sandwich",
    description: "Quick vegetable sandwich",
    cuisine_type: "Global",
    difficulty: "easy",
    prep_time: 5,
    cook_time: 5,
    servings: 1,
    ingredients: [
      { name: "Bread", quantity: 2, unit: "pieces" },
      { name: "Vegetables", quantity: 1, unit: "cup" },
    ],
    instructions: ["Assemble sandwich", "Serve"],
    dietary_tags: ["Vegetarian"],
  },
  {
    name: "Fried Rice",
    description: "Simple vegetable fried rice",
    cuisine_type: "Chinese",
    difficulty: "easy",
    prep_time: 10,
    cook_time: 15,
    servings: 2,
    ingredients: [
      { name: "Rice", quantity: 200, unit: "g" },
      { name: "Vegetables", quantity: 1, unit: "cup" },
    ],
    instructions: ["Cook rice", "Stir fry with veggies"],
    dietary_tags: ["Vegetarian"],
  },
  {
    name: "Dal Tadka",
    description: "Traditional Indian lentil dish",
    cuisine_type: "Indian",
    difficulty: "easy",
    prep_time: 10,
    cook_time: 25,
    servings: 3,
    ingredients: [
      { name: "Lentils", quantity: 200, unit: "g" },
      { name: "Spices", quantity: 2, unit: "tsp" },
    ],
    instructions: ["Cook dal", "Add tadka"],
    dietary_tags: ["Vegan"],
  },
];

const seedDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URL);

    console.log("DB Connected");

    await Recipe.deleteMany(); // optional (clears old data)

    await Recipe.insertMany(recipes);

    console.log("Recipes seeded 🌱");

    process.exit();
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

seedDB();
