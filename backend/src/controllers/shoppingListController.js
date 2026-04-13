import MealPlan from "../models/MealPlan.model.js";
import Recipe from "../models/Recipe.model.js";
import ShoppingListItem from "../models/ShoppingListItem.model.js";

/*
GET ALL ITEMS
*/
export const getShoppingList = async (req, res) => {
  try {
    const items = await ShoppingListItem.find({ user_id: req.user._id }).sort({
      created_at: -1,
    });

    res.json(items);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch shopping list",
      error: error.message,
    });
  }
};

/*
CREATE ITEM
*/
export const createShoppingListItem = async (req, res) => {
  try {
    const item = new ShoppingListItem({
      ...req.body,
      user_id: req.user._id,
    });

    const savedItem = await item.save();

    res.status(201).json(savedItem);
  } catch (error) {
    res.status(500).json({
      message: "Failed to create item",
      error: error.message,
    });
  }
};

/*
UPDATE ITEM (check/uncheck)
*/
export const updateShoppingListItem = async (req, res) => {
  try {
    const item = await ShoppingListItem.findOneAndUpdate(
      {
        _id: req.params.id,
        user_id: req.user._id,
      },
      req.body,
      { new: true },
    );

    if (!item) {
      return res.status(404).json({
        message: "Item not found",
      });
    }

    res.json(item);
  } catch (error) {
    res.status(500).json({
      message: "Failed to update item",
      error: error.message,
    });
  }
};

/*
DELETE ITEM
*/
export const deleteShoppingListItem = async (req, res) => {
  try {
    const item = await ShoppingListItem.findOneAndDelete({
      _id: req.params.id,
      user_id: req.user._id,
    });

    if (!item) {
      return res.status(404).json({
        message: "Item not found",
      });
    }

    res.json({
      message: "Item deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to delete item",
      error: error.message,
    });
  }
};

export const generateShoppingList = async (req, res) => {
  try {
    const mealPlans = await MealPlan.find({
      user_id: req.user._id,
    });

    const ingredientMap = {};

    for (const meal of mealPlans) {
      const recipe = await Recipe.findOne({
        _id: meal.recipe_id,
        user_id: req.user._id,
      });

      if (!recipe) continue; // prevent crash

      recipe.ingredients.forEach((ing) => {
        const key = ing.name + "_" + ing.unit;

        if (!ingredientMap[key]) {
          ingredientMap[key] = {
            ingredient_name: ing.name,
            quantity: 0,
            unit: ing.unit,
            category: "Other",
            is_checked: false,
            from_meal_plan: true,
          };
        }

        ingredientMap[key].quantity += ing.quantity;
      });
    }

    const finalList = Object.values(ingredientMap).map((item) => ({
      ...item,
      user_id: req.user._id,
    }));

    // remove old auto-generated items
    await ShoppingListItem.deleteMany({
      from_meal_plan: true,
      user_id: req.user._id,
    });

    const created = await ShoppingListItem.insertMany(finalList);

    res.json(created);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Failed to generate shopping list",
      error: error.message,
    });
  }
};
