import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("editor", "routes/editor._index.tsx"),
  route("editor/new", "routes/editor.new.tsx"),
  route("editor/:templateId", "routes/editor.$templateId.tsx"),
] satisfies RouteConfig;
