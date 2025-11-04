import { CustomForm, FormField } from "@/components/custom-form";
import React from "react";
import { KeyboardAvoidingView, Platform, ScrollView } from "react-native";

export default function RegisterPolicyScreen() {
  const dataForm: Record<string, string> = {
    yourName: "string",
    yourEmail: "string",
    yourPhone: "string",
    yourAddress: "string",
    testNumber: "int",
    testFloat: "float",
    switchOption: "switch",
    CheckboxOption: "checkbox",
  };

  const mapType = (t: string): FormField["type"] => {
    switch (t) {
      case "int":
      case "float":
        return "number";
      case "switch":
        return "switch";
      case "checkbox":
        return "checkbox";
      case "textarea":
        return "textarea";
      case "password":
        return "password";
      default:
        return "input";
    }
  };

  const toLabel = (key: string) =>
    key
      .replace(/([A-Z])/g, " $1")
      .replace(/^./, (s) => s.toUpperCase())
      .replace(/_/g, " ");

  const fields: FormField[] = Object.entries(dataForm).map(([name, type]) => ({
    name,
    label: toLabel(name),
    type: mapType(type),
    placeholder: "",
  }));

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={{ flex: 1 }}
    >
      <ScrollView
        contentContainerStyle={{ padding: 16 }}
        keyboardShouldPersistTaps="handled"
      >
        <CustomForm
          gap={24}
          fields={fields}
          onSubmit={(values) => {
            // replace with real submit handler later
            console.log("register-policy submit:", values);
          }}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
