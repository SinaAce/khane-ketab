import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().min(2, "نام باید حداقل ۲ کاراکتر باشد"),
  email: z.string().email("ایمیل معتبر نیست"),
  password: z.string().min(6, "رمز عبور باید حداقل ۶ کاراکتر باشد"),
});

export const loginSchema = z.object({
  email: z.string().email("ایمیل معتبر نیست"),
  password: z.string().min(1, "رمز عبور الزامی است"),
});

export const contentUploadSchema = z.object({
  title: z.string().min(2, "عنوان باید حداقل ۲ کاراکتر باشد"),
  description: z.string().optional(),
  type: z.enum(["EBOOK", "AUDIOBOOK"]),
  categoryId: z.string().min(1, "دسته‌بندی الزامی است"),
});

export const reviewSchema = z.object({
  rating: z.number().int().min(1).max(5),
  comment: z.string().max(1000).optional(),
});

export const searchSchema = z.object({
  q: z.string().optional(),
  type: z.enum(["EBOOK", "AUDIOBOOK"]).optional(),
  category: z.string().optional(),
  sort: z.enum(["newest", "popular", "rating"]).optional(),
  page: z.coerce.number().int().min(1).optional(),
  pageSize: z.coerce.number().int().min(1).max(100).optional(),
});

export const profileUpdateSchema = z
  .object({
    name: z.string().min(2, "نام باید حداقل ۲ کاراکتر باشد").optional(),
    currentPassword: z.string().optional(),
    newPassword: z.string().min(6, "رمز جدید باید حداقل ۶ کاراکتر باشد").optional(),
  })
  .refine(
    (data) => {
      if (data.newPassword && !data.currentPassword) return false;
      return true;
    },
    { message: "برای تغییر رمز، رمز فعلی الزامی است.", path: ["currentPassword"] },
  );
