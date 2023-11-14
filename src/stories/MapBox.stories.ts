import type { Meta, StoryObj } from '@storybook/react';

import MapBox from '../MapBox';

// More on how to set up stories at: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
const meta = {
  title: 'MapBox/Basic',
  component: MapBox,
  parameters: {
    // Optional parameter to center the component in the Canvas. More info: https://storybook.js.org/docs/react/configure/story-layout
    layout: 'fullscreen',
  },
  // This component will have an automatically generated Autodocs entry: https://storybook.js.org/docs/react/writing-docs/autodocs
  tags: ['autodocs'],
  // More on argTypes: https://storybook.js.org/docs/react/api/argtypes
  argTypes: {
    config: {
      control: 'object',
      description: 'configuration overrides'
    },
    // CENTER_ID: {
    //   control: 'string',
    //   description: 'Center ID to load',
    // },
    stats: {
      control: 'boolean',
      description: 'Show debug render stats',
    },
    mapitData: {
      control: 'object',
      description: 'Mapit data to use instead of fetching from API by CENTER_ID',
    },
    // mode: {
    //     control: 'radio',
    //     options: ['view', 'edit'],
    //     description: 'Mode to run in',
    //     defaultValue: 'view'
    // }
  },
} satisfies Meta<typeof MapBox>;

export default meta;
type Story = StoryObj<typeof meta>;

// More on writing stories with args: https://storybook.js.org/docs/react/writing-stories/args
export const Editor35: Story = {
  name: 'Editor: Center 35',
  args: {
    config:{
      ROLE: "PORTAL",
      CENTER_ID:'35',
      KIOSK: "102"
    }
  },
};

export const Editor33: Story = {
  name: 'Editor: Center 33',
  args: {
    config:{
      ROLE: "PORTAL",
      CENTER_ID:'33',
      KIOSK: "102"
    },
    webApiURI: 'https://web-backend-staging.eyeonportal.com/',
    mediaStorageURI: 'https://mycenterportal-media-staging.s3.us-east-2.amazonaws.com',
  },
};

export const Viewer33: Story = {
  name: 'Viewer: Center 33',
  args: {
    config:{
      ROLE: "WEBSITE",
      CENTER_ID:'33',
      KIOSK: "102"
    },
    webApiURI: 'https://web-backend-staging.eyeonportal.com/',
    mediaStorageURI: 'https://mycenterportal-media-staging.s3.us-east-2.amazonaws.com',
  },
};

export const Editor8: Story = {
  name: 'Editor: Center 8',
  args: {
    config:{
      ROLE: "PORTAL",
      CENTER_ID: "8",
      KIOSK: "52"
    },
  },
};

export const Viewer: Story = {
  args: {
    config:{
      CENTER_ID: "8",
      KIOSK: "52"
    },
    stats: true
  },
};

export const WidthDefaultSelected: Story = {
  args: {
    config:{
      CENTER_ID: "8",
      KIOSK: "52",
      DEFAULT_SELECTED_STORE: "store-102"
    },
  },
};

