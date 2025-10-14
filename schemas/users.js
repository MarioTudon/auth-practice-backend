import z from "zod"

const userSchema = z.object({
    username: z.string({
        invalid_type_error: 'must_be_a_string',
        required_error: 'is_required'
    })
    .min(4, 'must_be_at_least_4_characters_long')
    .regex(/^[^\s]+$/, 'must_not_contain_spaces')
    .transform(val => val.toLowerCase()),
    password: z.string({
        invalid_type_error: 'must_be_a_string',
        required_error: 'is_required'
    })
    .min(8, 'must_be_at_least_8_characters_long')
    .regex(/[a-z]/, 'must_contain_at_least_one_lowercase_character')
    .regex(/[A-Z]/, 'must_contain_at_least_one_uppercase_character')
    .regex(/[A-Z]/, 'must_contain_at_least_one_number')
    .regex(/^[^\s]+$/, 'must_not_contain_spaces')
})

export function validateUser(input) {
    return userSchema.safeParse(input)
}

export function validatePartialUser(input) {
    return userSchema.partial().safeParse(input)
}