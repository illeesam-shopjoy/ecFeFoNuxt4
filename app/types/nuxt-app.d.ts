import type { CoConfirmOptionsType } from "~/types/co/coConfirmType";
import type { CoAlertOptionsType } from "~/types/co/coAlertType";

declare module "#app" {
  interface NuxtApp {
    $confirm: (options: CoConfirmOptionsType) => Promise<boolean>;
    $alert: (messageOrOptions: string | CoAlertOptionsType) => Promise<void>;
  }
}
