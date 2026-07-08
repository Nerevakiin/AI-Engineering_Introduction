// If we wish to handle each response as JSON format types then we can import and use schemas like this to specifically guide and enforce the model on the
// right way to structure responses

export const giftSchema = {
  type: "json_schema",
  json_schema: {
    name: "gift_suggestions",
    schema: {
      type: "object",
      properties: {
        gifts: {
          type: "array",
          items: {
            type: "object",
            properties: {
              name: { type: "string" },
              price_range: { type: "string" },
              why_its_good: { type: "string" },
            },
            required: ["name", "price_range", "why_its_good"],
          },
        },
      },
      required: ["gifts"],
    },
  },
};
