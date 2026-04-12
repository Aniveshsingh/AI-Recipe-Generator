import MealPlan from "../models/MealPlan.model.js";

/*
GET ALL MEAL PLANS
*/
export const getMealPlans = async (req, res) => {
  try {
    const plans = await MealPlan.find({ user_id: req.user._id }).sort({
      meal_date: 1,
    });

    res.json(plans);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch meal plans",
      error: error.message,
    });
  }
};

/*
GET UPCOMING MEAL PLANS ---> important 
*/
export const getUpcomingMealPlans = async (req, res) => {
  try {
    const today = new Date();

    const plans = await MealPlan.find({
      meal_date: { $gte: today },
      user_id: req.user._id,
    }).sort({ meal_date: 1 });

    res.json(plans);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch upcoming meals",
      error: error.message,
    });
  }
};

/*
CREATE MEAL PLAN
*/
export const createMealPlan = async (req, res) => {
  try {
    const plan = new MealPlan({
      ...req.body,
      user_id: req.user._id,
    });

    const savedPlan = await plan.save();

    res.status(201).json(savedPlan);
  } catch (error) {
    res.status(500).json({
      message: "Failed to create meal plan",
      error: error.message,
    });
  }
};

/*
DELETE MEAL PLAN
*/
export const deleteMealPlan = async (req, res) => {
  try {
    const plan = await MealPlan.findOneAndDelete({
      _id: req.params.id,
      user_id: req.user._id,
    });

    if (!plan) {
      return res.status(404).json({
        message: "Meal plan not found",
      });
    }

    res.json({
      message: "Meal plan deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to delete meal plan",
      error: error.message,
    });
  }
};
