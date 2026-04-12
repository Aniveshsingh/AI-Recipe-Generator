import Recipe from "../models/Recipe.model.js";

/*
GET ALL RECIPES
 fetch all the recipes from database and since its a database call we have to use async await
*/
export const getRecipes = async (req, res) => {
  try {
    const recipes = await Recipe.find({ user_id: req.user._id }).sort({
      created_at: -1,
    });

    res.json(recipes);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch recipes",
      error: error.message,
    });
  }
};

/*
GET RECIPE BY ID
*/
export const getRecipeById = async (req, res) => {
  try {
    const recipe = await Recipe.findOne({
      _id: req.params.id,
      user_id: req.user._id,
    });

    if (!recipe) {
      return res.status(404).json({
        message: "Recipe not found",
      });
    }

    res.json(recipe);
  } catch (error) {
    res.status(500).json({
      message: "Error fetching recipe",
      error: error.message,
    });
  }
};

/*
create new recipe --> Post/recipes   --> our app will save recipes using this api

*/
export const createRecipe = async (req, res) => {
  try {
    const savedRecipe = await Recipe.create({
      ...req.body,
      user_id: req.user._id,
    });

    res.status(201).json(savedRecipe);
  } catch (error) {
    res.status(500).json({
      message: "Failed to create recipe",
      error: error.message,
    });
  }
};

/*
UPDATE RECIPES
 */
export const updateRecipe = async (req, res) => {
  try {
    const recipe = await Recipe.findOneAndUpdate(
      {
        _id: req.params.id,
        user_id: req.user._id,
      },
      req.body,
      { new: true }, /// without it returns old document
    );

    if (!recipe) {
      return res.status(404).json({
        message: "Recipe not found",
      });
    }

    res.json(recipe);
  } catch (error) {
    res.status(500).json({
      message: "Failed to update recipe",
      error: error.message,
    });
  }
};

/*
DELETE RECIPES
 */

export const deleteRecipe = async (req, res) => {
  try {
    const recipe = await Recipe.findOneAndDelete({
      _id: req.params.id,
      user_id: req.user._id,
    });

    if (!recipe) {
      return res.status(404).json({
        message: "Recipe not found",
      });
    }

    res.json({
      message: "recipe deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to delete recipe",
      error: error.message,
    });
  }
};
