declare module "*.mdx" {
  import type { ComponentType } from "react";

  export const changelog: {
    title: string;
    description: string;
    date: string;
    category: string;
    version?: string;
    tags?: string[];
    draft?: boolean;
  };

  const MDXContent: ComponentType;
  export default MDXContent;
}
