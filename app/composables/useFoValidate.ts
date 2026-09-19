/**
 * useFoValidate — <fo-form> 용 yup 검증 도우미 (2026-09-19).
 * vee-validate 의 <Form>/<Field> 대신 FoForm 에 넘길 errors 객체를 채워 준다.
 *   const { errors, validate } = useFoValidate(schema, form);
 *   async function onSubmit() { if (!(await validate())) return; ... }
 * errors 는 reactive 객체라 <fo-form :errors="errors"> 로 그대로 넘기면 필드 아래에 메시지가 표시된다.
 */
import { reactive } from "vue";
import type { AnyObjectSchema, ValidationError } from "yup";

export function useFoValidate(schema: AnyObjectSchema, form: Record<string, unknown>) {
  const errors = reactive<Record<string, string>>({});

  function clear() {
    Object.keys(errors).forEach((k) => delete errors[k]);
  }

  /** 모든 필드를 검증해 errors 를 채우고, 통과하면 true */
  async function validate(): Promise<boolean> {
    clear();
    try {
      await schema.validate(form, { abortEarly: false });
      return true;
    } catch (e) {
      for (const i of (e as ValidationError).inner ?? []) if (i.path && !errors[i.path]) errors[i.path] = i.message;
      return false;
    }
  }

  return { errors, validate, clear };
}
