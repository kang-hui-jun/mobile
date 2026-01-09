import { useAuth } from "@/store";
import { Cell } from "@/types/mobile-layout";
import { ChevronDown } from "@tamagui/lucide-icons";
import { Platform } from "react-native";
import { Button, Input, Label, TextArea, XStack } from "tamagui";

export const FormItem = ({ row }: { row: Cell }) => {
  const { formData, setFormData } = useAuth();

  const handleInput = (val: any) => {
    if (Platform.OS === "web") {
      setFormData({ ...formData, [row.name]: val.target.value });
    } else {
      setFormData({ ...formData, [row.name]: val });
    }
  };

  return (
    <XStack gap="$2" key={row.label} p="$2">
      <Label width={80} htmlFor="name" size={"$3"} overflowX={"auto"}>
        {row.label}
      </Label>
      {row.type === "text" &&
        (Platform.OS === "web" ? (
          <Input
            flex={1}
            id="name"
            placeholder="请输入"
            textAlign="right"
            size="$3"
            // @ts-ignore
            onChange={handleInput}
            value={formData[row.name || ""] as any}
            defaultValue={formData[row.value || ""] as any}
          />
        ) : (
          <Input
            flex={1}
            id="name"
            placeholder="请输入"
            textAlign="right"
            size="$3"
            // @ts-ignore
            onChangeText={handleInput}
            value={formData[row.name || ""] as any}
            defaultValue={formData[row.value || ""] as any}
          />
        ))}

      {["reference", "referencelist"].includes(row.type) && (
        <Button
          flex={1}
          justifyContent="flex-end"
          size={"$3"}
          iconAfter={<ChevronDown size="$1" color="$colorPress" />}
        >
          {formData[row.name] || "请选择"}
        </Button>
      )}

      {row.type === "location" && (
        <Input
          flex={1}
          id="name"
          placeholder="请输入"
          textAlign="right"
          size="$3"
          // @ts-ignore
          onChangeText={handleInput}
          value={formData[row.name || ""] as any}
          defaultValue={formData[row.value || ""] as any}
        />
      )}

      {row.type === "queryAssignment" && (
        <Input
          flex={1}
          id="name"
          placeholder="请输入"
          textAlign="right"
          size="$3"
          // @ts-ignore
          onChangeText={handleInput}
          value={formData[row.name || ""] as any}
          defaultValue={formData[row.value || ""] as any}
        />
      )}

      {row.type === "number" && (
        <Input
          flex={1}
          id="name"
          placeholder="请输入"
          textAlign="right"
          size="$3"
          // @ts-ignore
          onChangeText={handleInput}
          value={formData[row.name || ""] as any}
          defaultValue={formData[row.value || ""] as any}
        />
      )}

      {row.type === "phone" && (
        <Input
          flex={1}
          id="name"
          placeholder="请输入"
          textAlign="right"
          size="$3"
          // @ts-ignore
          onChangeText={handleInput}
          value={formData[row.name || ""] as any}
          defaultValue={formData[row.value || ""] as any}
        />
      )}

      {row.type === "textarea" && (
        <TextArea
          flex={1}
          id="name"
          placeholder="请输入"
          textAlign="right"
          size="$3"
          // @ts-ignore
          onChangeText={handleInput}
          value={formData[row.name || ""] as any}
          defaultValue={formData[row.value || ""] as any}
        />
      )}

      {row.type === "picklist" && (
        <Button
          flex={1}
          justifyContent="flex-end"
          size={"$3"}
          iconAfter={<ChevronDown size="$1" color="$colorPress" />}
        >
          {formData[row.name] || "请选择"}
        </Button>
      )}

      {row.type === "multi" && (
        <Button
          flex={1}
          justifyContent="flex-end"
          size={"$3"}
          iconAfter={<ChevronDown size="$1" color="$colorPress" />}
        >
          {formData[row.name] || "请选择"}
        </Button>
      )}

      {["datetime", "date"].includes(row.type) && (
        <Button
          flex={1}
          justifyContent="flex-end"
          size={"$3"}
          iconAfter={<ChevronDown size="$1" color="$colorPress" />}
        >
          {formData[row.name] || "请选择"}
        </Button>
      )}

      {row.type === "area" && (
        <Button
          flex={1}
          justifyContent="flex-end"
          size={"$3"}
          iconAfter={<ChevronDown size="$1" color="$colorPress" />}
        >
          {formData[row.name] || "请选择"}
        </Button>
      )}

      {row.type === "docComponent" && (
        <Button
          flex={1}
          justifyContent="flex-end"
          size={"$3"}
          iconAfter={<ChevronDown size="$1" color="$colorPress" />}
        >
          {formData[row.name] || "请选择"}
        </Button>
      )}
    </XStack>
  );
};
