import { Card, Image } from "tamagui";
import Digital from "@/assets/images/digital.png";

export const DataPlate = () => {
  return (
    <Card h={118} p={16} bg={"#FFF"} borderRadius="$0">
      <Card.Background p={16}>
        <Image
          alignSelf="center"
          width="100%"
          height="100%"
          source={Digital}
          borderRadius="$4"
        />
      </Card.Background>
    </Card>
  );
};
