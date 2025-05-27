export const validateFields = (fields, mode) => {
  return (req, res, next) => {
    if (mode === "all") {
      const missingFields = fields.filter((f) => !req.body[f]);
      if (missingFields.length > 0) {
        return res.status(400).json({
          error: "Missing required fields",
        });
      }
    }
    if (mode === "any") {
      const atLeastOne = fields.some((f) => req.body[f]);
      if (!atLeastOne) {
        return res.status(400).json({
          error: "At least one field is required",
        });
      }
    }
    next();
  };
};
