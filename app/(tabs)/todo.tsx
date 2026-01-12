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
    entity: "",
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
    if (fields) {
      setSearchParams({
        ...searchParams,
        fields: fields?.map((item) => item.fieldName).join(","),
      });
    }
  }, [fields]);

  // 初始化
  useEffect(() => {
    if (menu) {
      // 设置title
      setTitle(menu?.menus?.[0].name);
      // 一级菜单选中
      setActiveId(activeId || menu?.menus[0]?.type);
      // 二级菜单数据
      const childrenMenu = menu?.menus[0].children;
      setChildrenMenu(childrenMenu);
      // 二级菜单选中
      setChildrenActiveId(childrenMenu[0].name);
      // 设置entityName
      setEntity(childrenMenu[0].entityName);
      // 请求参数
      setSearchParams({
        ...searchParams,
        entity: childrenMenu[0].entityName,
      });
    }
  }, [menu]);

  const handleTabChange = (id: string) => {
    const title = menu?.menus?.find((menu: TodoMenu) => menu.type === id)?.name;
    setTitle(title || "");
    setActiveId(id);
    const findChildrenMenu =
      menu?.menus?.find((menu: TodoMenu) => menu.type === id)?.children || [];
    setChildrenMenu(findChildrenMenu);
    setChildrenActiveId(findChildrenMenu?.[0]?.name || "");
    setEntity(findChildrenMenu?.[0]?.entityName || "");
  };

  const handleChildrenTabChange = (id: string) => {
    const entityName =
      childrenMenu?.find((k) => k.name === id)?.entityName || "";
    setChildrenActiveId(id);
    setEntity(entityName);
    setSearchParams({
      ...searchParams,
      entity: entityName,
      fields: fields?.map((item) => item.fieldName)?.join(",") || "",
    });
    const data = childrenMenu?.find((k) => k.name === id)?.filter;
    setSearchData(JSON.parse(data as any));
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
          headerShown: true,
        }}
      />
      <HorizontalTabs
        data={menu?.menus || []}
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
