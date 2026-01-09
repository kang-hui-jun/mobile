import { HorizontalTabs } from "@/components/HorizontalTabs";
import { InfiniteList } from "@/components/InfiniteList";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { useToDoCenterMenus } from "@/service/todo";
import { useAdvQueryZn, useGridColumnFields } from "@/service/universal";
import { Filter } from "@/types/grid-filter";
import { TodoChild, TodoMenu } from "@/types/to-do-menu";
import { useQueryClient } from "@tanstack/react-query";
import { Stack } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { Card, Spinner } from "tamagui";

export default function TodoScreen() {
  const queryClient = useQueryClient();
  const [activeId, setActiveId] = useState("");
  const [entity, setEntity] = useState("");
  const [childrenActiveId, setChildrenActiveId] = useState("");
  const [childrenMenu, setChildrenMenu] = useState<TodoChild[]>([]);
  const [title, setTitle] = useState("");
  const [searchParams, setSearchParams] = useState({
    isDeleted: 0,
    entity:"",
    fields: "",
  });
  const [searchData, setSearchData] = useState<Filter>();

  const { data: menu, isLoading } = useToDoCenterMenus();

  const { data: fields } = useGridColumnFields({ entity });

  const {
    data: list,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isRefetching,
  } = useAdvQueryZn(searchParams, searchData, {
    enabled: !!searchData,
  });

  const listData = useMemo(() => {
    return list?.pages.flatMap((page) => page.list) || [];
  }, [list]);

  useEffect(() => {
    if (menu) {
      setActiveId(activeId || menu?.data?.menus[0].type);
      setChildrenMenu(menu?.data?.menus[0].children);
      setChildrenActiveId(menu?.data?.menus[0].children[0].name);
    //   setEntity(menu?.data?.menus[0].children[0].entityName);
      //   console.log(menu?.data?.menus[0].children[0].filter);

      //   setSearchData(JSON.parse(menu?.data?.menus[0].children[0].filter))
    }
  }, [menu]);

  const handleTabChange = (id: string) => {
    const title = menu?.data?.menus.find(
      (menu: TodoMenu) => menu.type === id
    )?.name;
    setTitle(title);
    setActiveId(id);
    setChildrenMenu(
      menu?.data?.menus.find((menu: TodoMenu) => menu.type === id).children
    );
    setChildrenActiveId(
      menu?.data?.menus.find((menu: TodoMenu) => menu.type === id).children[0]
        .name
    );
    // setSearchData(
    //   menu?.data?.menus.find((menu: TodoMenu) => menu.type === id).children[0]
    //     .filter
    // );
    setEntity(
      menu?.data?.menus.find((menu: TodoMenu) => menu.type === id).children[0]
        .entityName
    );
  };

  const handleChildrenTabChange = (id: string) => {
    const entityName =
      childrenMenu?.find((k) => k.name === id)?.entityName || "";
    setChildrenActiveId(id);
    setEntity(entityName);
    setSearchParams({
      ...searchParams,
      entity: entityName,
      fields: fields?.map((item) => item.fieldName).join(",")
    });
    const data = childrenMenu?.find((k) => k.name === id)?.filter;
    setSearchData(JSON.parse(data));

  };

  const handleRefresh = async () => {
    await queryClient.resetQueries({
      queryKey: ["advQueryZn", searchParams, searchData],
    });
  };

  if (isLoading) return <Spinner size="small" color="$green10" />;

  return (
    <ThemedView>
      <Stack.Screen
        options={{
          title: title,
          headerShown: true, // 确保显示
        }}
      />
      <HorizontalTabs
        data={menu?.data?.menus || []}
        activeId={activeId}
        onTabChange={handleTabChange}
        idField="type"
        labelField="name"
      />
      <HorizontalTabs
        data={childrenMenu}
        activeId={childrenActiveId}
        onTabChange={handleChildrenTabChange}
        idField="name"
        labelField="name"
      />
      <InfiniteList
        style={{ padding: 4 }}
        data={listData}
        isRefreshing={isRefetching}
        isLoading={isFetchingNextPage}
        hasMore={!!hasNextPage}
        onRefresh={handleRefresh}
        onLoadMore={fetchNextPage}
        keyExtractor={(item) => item.id}
        ItemSeparatorComponent={() => (
          <ThemedView
            style={{ height: 8, backgroundColor: "rgba(0, 0, 0, 0.00)" }}
          />
        )}
        renderItem={({ item }) => (
          <Card
            key={item.accountId}
            bg="#FFFFFF"
            // onPress={() => handleNavigator(item)}
          >
            <Card.Header>
              <ThemedText style={{ fontWeight: "bold" }}>
                {fields?.map((k) => (
                  <ThemedText key={k.fieldName}>
                    {k.fieldLabel}:{item[k.fieldName]}
                  </ThemedText>
                ))}
              </ThemedText>
            </Card.Header>
          </Card>
        )}
      />
    </ThemedView>
  );
}
