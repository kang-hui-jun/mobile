import { useAuth } from "@/store";
import { Cell } from "@/types/mobile-layout";
import { ChevronDown, FileImage, Scan } from "@tamagui/lucide-icons";
import { useCameraPermissions } from "expo-camera";
import { useState } from "react";
import { Platform } from "react-native";
import { Button, Input, Label, TextArea, XStack, YStack } from "tamagui";

export const FormItem = ({ row }: { row: Cell }) => {
  const { formData, setFormData } = useAuth();
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);

  // if (!permission?.granted) {
  //   return (
  //     <YStack f={1} jc="center" ai="center">
  //       <Text>我们需要相机权限来扫描二维码</Text>
  //       <Button onPress={requestPermission}>授予权限</Button>
  //     </YStack>
  //   );
  // }

  const handleBarcodeScanned = ({
    type,
    data,
  }: {
    type: string;
    data: string;
  }) => {
    setScanned(true);
    alert(`扫描成功！内容是: ${data}`);
    // 这里可以将 data 填入你的 formData 中
  };

  const handleInput = (val: any) => {
    if (Platform.OS === "web") {
      setFormData({ ...formData, [row.name]: val.target.value });
    } else {
      setFormData({ ...formData, [row.name]: val });
    }
  };

  const Col = row.type === "textarea" ? YStack : XStack;

  return (
    <Col gap="$2" key={row.label} p="$2">
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
          bg="$gray2"
          bc="$borderColor"
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
        <XStack flex={1} alignItems="center" gap={4}>
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
          <Scan color={"$gray10"} />
        </XStack>
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

      {row.type === "decimal" && (
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

      {row.type === "money" && (
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
          bg="$gray2"
          bc="$borderColor"
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
          bg="$gray2"
          bc="$borderColor"
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
          bg="$gray2"
          bc="$borderColor"
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
          bg="$gray2"
          bc="$borderColor"
          size={"$3"}
          iconAfter={<ChevronDown size="$1" color="$colorPress" />}
        >
          {formData[row.name] || "请选择"}
        </Button>
      )}

      {row.type === "picture" && (
        <XStack
          bg="$gray3"
          bw={1}
          bc="$borderColor"
          br="$2"
          w={62}
          h={62}
          ai="center"
          jc="center"
          // onPress={() => pickImage(fieldKey)}
          ml={"auto"}
        >
          <FileImage size="$2" color="$gray10" />
        </XStack>
      )}

      {row.type === "attachment" && (
        <XStack
          bg="$gray3"
          bw={1}
          bc="$borderColor"
          br="$2"
          w={62}
          h={62}
          ai="center"
          jc="center"
          ml={"auto"}
          // onPress={() => pickImage(fieldKey)}
        >
          <FileImage size="$2" color="$gray10" />
        </XStack>
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
    </Col>
  );
};
