// Welcome to your schema
//   Schema driven development is Keystone's modus operandi
//
// This file is where we define the lists, fields and hooks for our data.
// If you want to learn more about how lists are configured, please read
// - https://keystonejs.com/docs/config/lists

import { list } from '@keystone-6/core'
import { allowAll } from '@keystone-6/core/access'

// see https://keystonejs.com/docs/fields/overview for the full list of fields
//   this is a few common fields for an example
import {
  text,
  relationship,
  password,
  timestamp,
  select,
  calendarDay,
} from '@keystone-6/core/fields'

// the document field is a more complicated field, so it has it's own package
import { document } from '@keystone-6/fields-document'
// if you want to make your own fields, see https://keystonejs.com/docs/guides/custom-fields

// when using Typescript, you can refine your types to a stricter subset by importing
// the generated types from '.keystone/types'
import { type Lists } from '.keystone/types'

export const lists = {
  User: list({
    // WARNING
    //   for this starter project, anyone can create, query, update and delete anything
    //   if you want to prevent random people on the internet from accessing your data,
    //   you can find out more at https://keystonejs.com/docs/guides/auth-and-access-control
    access: allowAll,

    // this is the fields for our User list
    fields: {
      // by adding isRequired, we enforce that every User should have a name
      //   if no name is provided, an error will be displayed
      name: text({ validation: { isRequired: true } }),

      email: text({
        validation: { isRequired: true },
        // by adding isIndexed: 'unique', we're saying that no user can have the same
        // email as another user - this may or may not be a good idea for your project
        isIndexed: 'unique',
      }),

      password: password({ validation: { isRequired: true } }),

      // we can use this field to see what Posts this User has authored
      //   more on that in the Post list below
      posts: relationship({ ref: 'Post.author', many: true }),

      createdAt: timestamp({
        // this sets the timestamp to Date.now() when the user is first created
        defaultValue: { kind: 'now' },
      }),
    },
  }),

  Footer: list({
    access: allowAll,
    fields: {
      text: document({
          formatting: true,
          validation: { isRequired: true } }),
    },
  }),

  Post: list({
    // WARNING
    //   for this starter project, anyone can create, query, update and delete anything
    //   if you want to prevent random people on the internet from accessing your data,
    //   you can find out more at https://keystonejs.com/docs/guides/auth-and-access-control
    access: allowAll,

    // this is the fields for our Post list
    fields: {
      title: text({ validation: { isRequired: true } }),

      // the document field can be used for making rich editable content
      //   you can find out more at https://keystonejs.com/docs/guides/document-fields
      content: document({
        formatting: true,
        layouts: [
          [1, 1],
          [1, 1, 1],
          [2, 1],
          [1, 2],
          [1, 2, 1],
        ],
        links: true,
        dividers: true,
      }),

      // with this field, you can set a User as the author for a Post
      author: relationship({
        // we could have used 'User', but then the relationship would only be 1-way
        ref: 'User.posts',

        // this is some customisations for changing how this will look in the AdminUI
        ui: {
          displayMode: 'cards',
          cardFields: ['name', 'email'],
          inlineEdit: { fields: ['name', 'email'] },
          linkToItem: true,
          inlineConnect: true,
        },

        // a Post can only have one author
        //   this is the default, but we show it here for verbosity
        many: false,
      }),

      // with this field, you can add some Tags to Posts
      tags: relationship({
        // we could have used 'Tag', but then the relationship would only be 1-way
        ref: 'Tag.posts',

        // a Post can have many Tags, not just one
        many: true,

        // this is some customisations for changing how this will look in the AdminUI
        ui: {
          displayMode: 'cards',
          cardFields: ['name'],
          inlineEdit: { fields: ['name'] },
          linkToItem: true,
          inlineConnect: true,
          inlineCreate: { fields: ['name'] },
        },
      }),
    },
  }),

  Consultation: list({
    access: allowAll,
    hooks: {
      validateInput: async ({ resolvedData, addValidationError, context, operation, item }) => {
        const willCheckOnUpdate =
          operation === 'update' &&
          ((resolvedData.selectDate && resolvedData.selectDate !== item?.selectDate) ||
            (resolvedData.preferredTime && resolvedData.preferredTime !== item?.preferredTime));

        if (operation === 'create' || willCheckOnUpdate) {
          let date: any = resolvedData.selectDate as any;
          const normalizePreferredTime = (input: any) => {
            if (input == null) return input;
            const s = String(input).toUpperCase().trim();
            const compact = s.replace(/[:.\s]+/g, '');
            const noZero = compact.replace(/^0+/, '');
            const m = noZero.match(/^(\d{1,2})(AM|PM)$/);
            if (m) {
              const hour = parseInt(m[1], 10);
              const ampm = m[2];
              return `${hour} ${ampm}`;
            }
            return String(input).trim();
          };

          let time = normalizePreferredTime(resolvedData.preferredTime as any);
          if (time) resolvedData.preferredTime = time as any;
          
          if (date instanceof Date) {
            date = date.toISOString().slice(0, 10);
          } else if (typeof date === 'object' && date !== null && typeof (date as any).toISOString === 'function') {
            date = new Date(date).toISOString().slice(0, 10);
          }
          
          if (date && time) {
            const existing = await context.db.Consultation.findMany({
              where: {
                selectDate: { equals: date },
                preferredTime: { equals: time },
              },
              take: 1,
            });
            if (existing && existing.length > 0) {
              addValidationError('This time is already booked for the selected date. Please choose another time.');
            }
          }
        }
      },
    },
    fields: {
      Schedule_a_Consultation: text({
        ui: {
          description: 'Free 30-minute Consultation\n\nSpeak with our training experts about your certification needs.',
          itemView: { fieldMode: 'read' },
        },
        validation: { isRequired: true },
      }),
      selectDate: calendarDay({
        ui: {
          description: 'Choose a date for your consultation.',
        },
        validation: { isRequired: true },
      }),
      preferredTime: select({
        options: [
          { label: '9 AM', value: '9 AM' },
          { label: '10 AM', value: '10 AM' },
          { label: '1 PM', value: '1 PM' },
          { label: '2 PM', value: '2 PM' },
          { label: '3 PM', value: '3 PM' },
          { label: '4 PM', value: '4 PM' },
        ],
        ui: {
          displayMode: 'segmented-control',
        },
      }),
      fullName: text({ validation: { isRequired: true } }),
      email: text({ validation: { isRequired: true } }),
    },
  }),

  Tag: list({
    // WARNING
    //   for this starter project, anyone can create, query, update and delete anything
    //   if you want to prevent random people on the internet from accessing your data,
    //   you can find out more at https://keystonejs.com/docs/guides/auth-and-access-control
    access: allowAll,

    // setting this to isHidden for the user interface prevents this list being visible in the Admin UI
    ui: {
      isHidden: true,
    },

    // this is the fields for our Tag list
    fields: {
      name: text(),
      // this can be helpful to find out all the Posts associated with a Tag
      posts: relationship({ ref: 'Post.tags', many: true }),
    },
  }),
} satisfies Lists
