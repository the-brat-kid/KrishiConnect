import * as z from "zod";

export const loginSchema = z.object({
  email: z.string().email({ message: "Invalid email address" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
});

export const registerSchema = z.object({
  email: z.string().email({ message: "Invalid email address" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
  name: z.string().min(2, { message: "Full name must be at least 2 characters" }),
  businessType: z.enum(["Individual", "Merchant", "F&O Buyer"], {
    errorMap: () => ({ message: "Please select a user type" }),
  }),
  address: z.string().min(5, { message: "Address must be at least 5 characters" }),
  gstNumber: z.string().optional(),
  upiId: z.string().optional(),
});
