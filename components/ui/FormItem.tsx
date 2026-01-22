import { useAuth } from "@/store";
import { Cell } from "@/types/mobile-layout";
import { ChevronDown, FileImage, Scan } from "@tamagui/lucide-icons";
import { useCameraPermissions } from "expo-camera";
import { useState } from "react";
import { Platform } from "react-native";
import { Button, Input, Label, TextArea, XStack, YStack, Image } from "tamagui";
import * as ImagePicker from "expo-image-picker";
import { getDocValue, getLabelSafe, getUriSafe } from "@/utils/universal";

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

  const disabled = row.readable || !row.canCreate;

  const pickImage = async (field: string) => {
    const { granted } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!granted) return;

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled) {
      // 存储文件路径或名称
      console.log(formData[field]);
      const urls = formData[field] as string[];
      urls.push(result.assets[0].uri);
      const updatedFormData = { ...formData, [field]: urls };
      console.log({ ...formData, [field]: urls });

      setFormData(updatedFormData);
    }
  };

  return (
    <Col gap="$2" key={row.label} p="$2">
      <Label width={80} htmlFor="name" size={"$3"} whiteSpace={"nowrap"}>
        {row.label}
      </Label>
      {[
        "text",
        "location",
        "url",
        "percent",
        "number",
        "decimal",
        "money",
        "phone",
      ].includes(row.type) &&
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
            defaultValue={formData[row.name || ""] as any}
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
            defaultValue={formData[row.name || ""] as any}
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
          {getLabelSafe(row.name, formData)}
        </Button>
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
            defaultValue={formData[row.name || ""] as any}
          />
          <Scan color={"$gray10"} />
        </XStack>
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
          defaultValue={formData[row.name || ""] as any}
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
        <XStack ai="center" flex={1} gap={"$2"} justifyContent={"flex-end"}>
          {getUriSafe(row.name, formData)?.map((uri) => (
            <XStack br="$2" w={62} h={62} ai="center" jc="center">
              <Image
                alignSelf="center"
                width="100%"
                height="100%"
                source={{
                  uri,
                }}
                borderRadius="$4"
              />
            </XStack>
          ))}
          <XStack
            bg="$gray3"
            bw={1}
            bc="$borderColor"
            br="$2"
            w={62}
            h={62}
            ai="center"
            jc="center"
            onPress={() => pickImage(row.name)}
          >
            <FileImage size="$2" color="$gray10" />
          </XStack>
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
          onPress={() => pickImage(row.name)}
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
          {getDocValue(row.name, formData) || "请选择"}
        </Button>
      )}
    </Col>
  );
};
