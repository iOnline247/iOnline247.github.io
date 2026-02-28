import { createRoot } from "react-dom/client";
import { createElement } from "react";
import { createApp } from "vue";
import { mount as mountSvelte } from "svelte";

type Framework = "react" | "vue" | "svelte";
type IslandProps = Record<string, unknown>;
type IslandModule = { default: unknown };
type ComponentLoader = () => Promise<IslandModule>;

type FrameworkRegistry = Record<string, ComponentLoader>;

type MountFn = (
  component: unknown,
  target: HTMLElement,
  props: IslandProps
) => void;

const registry: Record<Framework, FrameworkRegistry> = {
  react: {
    Counter: () => import("../components/react/Counter.jsx")
  },
  vue: {
    GreetingCard: () => import("../components/vue/GreetingCard.vue")
  },
  svelte: {
    FeatureList: () => import("../components/svelte/FeatureList.svelte")
  }
};

const isFramework = (value: string | undefined): value is Framework => {
  return value === "react" || value === "vue" || value === "svelte";
};

const parseProps = (rawProps?: string): IslandProps => {
  if (!rawProps) {
    return {};
  }

  try {
    const parsed: unknown = JSON.parse(rawProps);

    if (typeof parsed === "object" && parsed !== null && !Array.isArray(parsed)) {
      return parsed as IslandProps;
    }

    return {};
  } catch (error) {
    console.warn("[islands] Invalid props JSON:", error);
    return {};
  }
};

const mountReact: MountFn = (Component, target, props) => {
  createRoot(target).render(createElement(Component as never, props));
};

const mountVue: MountFn = (Component, target, props) => {
  createApp(Component as object, props).mount(target);
};

const mountSvelteComponent: MountFn = (Component, target, props) => {
  mountSvelte(Component as never, { target, props });
};

const mountByFramework: Record<Framework, MountFn> = {
  react: mountReact,
  vue: mountVue,
  svelte: mountSvelteComponent
};

const mountIslands = async (): Promise<void> => {
  const islands = document.querySelectorAll<HTMLElement>("[data-island-framework][data-island-component]");

  for (const island of islands) {
    const framework = island.dataset.islandFramework;
    const componentName = island.dataset.islandComponent;
    const rawProps = island.dataset.islandProps;

    if (!isFramework(framework) || !componentName) {
      console.warn("[islands] Missing or invalid framework/component on island node");
      continue;
    }

    const componentLoader = registry[framework]?.[componentName];
    const mount = mountByFramework[framework];

    if (!componentLoader) {
      console.warn(`[islands] Unknown island ${framework}:${componentName}`);
      continue;
    }

    const props = parseProps(rawProps);

    try {
      const module = await componentLoader();
      mount(module.default, island, props);
    } catch (error) {
      console.error(`[islands] Failed to mount ${framework}:${componentName}`, error);
    }
  }
};

void mountIslands();
