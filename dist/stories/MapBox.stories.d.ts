import type { StoryObj } from '@storybook/react';
import MapBox from '../MapBox';
declare const meta: {
    title: string;
    component: typeof MapBox;
    parameters: {
        layout: string;
    };
    tags: string[];
    argTypes: {
        config: {
            control: string;
            description: string;
        };
        stats: {
            control: string;
            description: string;
        };
        mapitData: {
            control: string;
            description: string;
        };
    };
};
export default meta;
type Story = StoryObj<typeof meta>;
export declare const Editor35: Story;
export declare const Editor33: Story;
export declare const Viewer33: Story;
export declare const Editor8: Story;
export declare const Viewer: Story;
export declare const WidthDefaultSelected: Story;
