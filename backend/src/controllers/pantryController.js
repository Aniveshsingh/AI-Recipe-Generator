import PantryItem from "../models/PantryItems.model.js";

// GET ALL PANTRY ITEMS
export const getPantry = async (req, res) => {
  try {
    const items = await PantryItem.find({ user_id: req.user._id }).sort({
      created_at: -1,
    });
    res.json(items);
  } catch (error) {
    res.status(500).json({
      message: "failed to fetch pantry items",
      error: error.message,
    });
  }
};

// GET single pantry item

export const getPantryById = async (req, res) => {
  try {
    const item = await PantryItem.findOne({
      _id: req.params.id,
      user_id: req.user._id,
    });

    if (!item) {
      return res.status(404).json({
        message: "Item not found",
      });
    }
    res.json(item);
  } catch (error) {
    res.status(500).json({
      message: "failed to find the item",
      error: error.message,
    });
  }
};

// Create Pantry Item
export const createPantry = async (req, res) => {
  try {
    const item = new PantryItem({
      ...req.body,
      user_id: req.user._id,
    });
    const savedItem = await item.save();

    res.status(200).json(savedItem);
  } catch (error) {
    res.status(500).json({
      message: "Failed to create pantry item",
      error: error.message,
    });
  }
};

// update Pantry Item
export const updatePantry = async (req, res) => {
  try {
    const item = await PantryItem.findOneAndUpdate(
      {
        _id: req.params.id,
        user_id: req.user._id,
      },
      req.body,
      {
        new: true,
      },
    );
    if (!item) {
      return res.status(404).json({
        message: "Pantry item not found",
      });
    }

    res.json(item);
  } catch (error) {
    res.status(500).json({
      message: "Failed to update pantry item",
      error: error.message,
    });
  }
};

/*
DELETE PANTRY ITEM
*/
export const deletePantryItem = async (req, res) => {
  try {
    console.log("deleting id", req.params.id);
    const item = await PantryItem.findOneAndDelete({
      _id: req.params.id,
      user_id: req.user._id,
    });
    console.log(item);
    if (!item) {
      return res.status(404).json({
        message: "Pantry item not found",
      });
    }

    res.json({
      message: "Pantry item deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to delete pantry item",
      error: error.message,
    });
  }
};
