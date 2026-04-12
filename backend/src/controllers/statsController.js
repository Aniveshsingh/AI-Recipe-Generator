import Recipe from "../models/Recipe.model.js";
import PantryItem from "../models/PantryItems.model.js";
import MealPlan from "../models/MealPlan.model.js";

/*
GET DASHBOARD STATS
*/
export const getStats = async (req, res) => {
  try {
    // RECIPES STATS
    const totalRecipes = await Recipe.countDocuments({
      user_id: req.user._id,
    });

    const cuisineTypes = await Recipe.distinct("cuisine_type", {
      user_id: req.user._id,
    });

    const avgCookTimeResult = await Recipe.aggregate([
      {
        $match: {
          user_id: req.user._id,
        },
      },
      {
        $group: {
          _id: null,
          avgCookTime: { $avg: "$cook_time" },
        },
      },
    ]);

    const avgCookTime = avgCookTimeResult[0]?.avgCookTime || 0;

    // PANTRY STATS
    const totalItems = await PantryItem.countDocuments({
      user_id: req.user._id,
    });

    const categories = await PantryItem.distinct("category", {
      user_id: req.user._id,
    });

    const runningLowCount = await PantryItem.countDocuments({
      is_running_low: true,

      user_id: req.user._id,
    });

    // expiring soon (next 7 days)
    const today = new Date();
    const next7Days = new Date();
    next7Days.setDate(today.getDate() + 7);

    const expiringSoonCount = await PantryItem.countDocuments({
      user_id: req.user._id,
      expiry_date: {
        $gte: today,
        $lte: next7Days,
      },
    });

    // MEAL PLAN STATS
    const totalPlannedMeals = await MealPlan.countDocuments({
      user_id: req.user._id,
    });

    const thisWeek = new Date();
    const nextWeek = new Date();
    nextWeek.setDate(thisWeek.getDate() + 7);

    const thisWeekCount = await MealPlan.countDocuments({
      user_id: req.user._id,

      meal_date: {
        $gte: thisWeek,
        $lte: nextWeek,
      },
    });

    // FINAL RESPONSE (MATCHING YOUR FRONTEND)
    res.json({
      recipes: {
        total_recipes: totalRecipes,
        cuisine_types_count: cuisineTypes.length,
        avg_cook_time: Math.round(avgCookTime),
      },
      pantry: {
        total_items: totalItems,
        total_categories: categories.length,
        running_low_count: runningLowCount,
        expiring_soon_count: expiringSoonCount,
      },
      mealPlans: {
        total_planned_meals: totalPlannedMeals,
        this_week_count: thisWeekCount,
      },
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch stats",
      error: error.message,
    });
  }
};
