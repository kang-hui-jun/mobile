import { InfiniteList } from "@/components/InfiniteList";
import { useAdvQueryZn } from "@/service/universal";
import { useRouter } from "expo-router";
import { Text, View } from "react-native";
import { Button } from "tamagui";

export default function HomeScreen() {
  const router = useRouter();
  const { data } = useAdvQueryZn(
    {
      page_no: 1,
      isDeleted: 0,
      entity: "Account",
      fields:
        "createdOn,c__NO,owningUser,c__xingming,accountName,c__shouji,c__hesuanzhuti,c__qichuyingshoujine,c__xiaoshoujine,c__xiaoshouhuikuan,c__yingshouzhangkuan,c__yushouzhangkuan,c__xiaoshouchengben,c__xiaoshoumaoli,c__zuijinxiaoshouriqi,c__qitayingfuyue,c__shijiyingshoukuan,c__hesuanzhuti.c__zhutimingcheng,lastSalesOrderDate,c__gongsileixing,email,c__fuwufuzebumen,c__qichuweikaipiao,applyStatus,typeCode,c__fuwufuzeren,lastContactedOn,c__jingyingzhuangtai,kfAge,kfNotes,postalCode",
    },
    {
      times: 1766468339486,
      type: "AND",
      filters: [
        {
          fieldName: "owningHighSea",
          type: "reference",
          operator: "=",
          value: "$NULL$",
          filterType: "AND",
        },
      ],
      children: [],
    }
  );

  return (
    // <InfiniteList
    //   data={listData}
    //   isRefreshing={isRefetching}
    //   isLoading={isFetchingNextPage}
    //   hasMore={!!hasNextPage}
    //   onRefresh={refetch}
    //   onLoadMore={fetchNextPage}
    //   renderItem={({ item }) => (
    <View style={{ padding: 20, borderBottomWidth: 1, borderColor: "#eee" }}>
      <Button width={"100%"} onPress={()=>{
        router.push("/modal")
      }}>click</Button>
    </View>
    //   )}
    // />
  );
}
