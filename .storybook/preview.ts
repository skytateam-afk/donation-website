import type { Preview } from '@storybook/vue3';
import '../src/style.css'; // Import Tailwind CSS

const preview: Preview = {
  parameters: {
    actions: { argTypesRegex: '^on[A-Z].*' },

    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },

    backgrounds: {
      default: 'dark',
      values: [
        {
          name: 'dark',
          value: '#020617', // slate-950
        },
        {
          name: 'light',
          value: '#f8fafc', // slate-50
        },
      ],
    },

    docs: {
      toc: true,
    },

    a11y: {
      // 'todo' - show a11y violations in the test UI only
      // 'error' - fail CI on a11y violations
      // 'off' - skip a11y checks entirely
      test: 'todo'
    }
  },
};

export default preview;
