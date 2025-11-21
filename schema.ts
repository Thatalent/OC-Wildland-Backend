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
  integer,
  image,
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

  // Used for storing images used in the frontend
  Image: list({
    access: allowAll,
    fields: {
      imageUrl: image({ storage: 'local_image_storage' }),
      name: text({ validation: { isRequired: true } }),
      altText: text(),
    },
  }),

  Testimony: list({
    access: allowAll,
    fields: {
      name: text({ validation: { isRequired: true } }),
      role: text(),
      message: text({ ui: { displayMode: 'textarea' } }),
      imageUrl: text(),
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

  KPIstats: list({
    access: allowAll,
    graphql: {
      plural: 'kpiStatistics'
    },

    fields: {
      name: text({
        validation: { isRequired: true },
        db: { isNullable: false },
      }),

      groupsTrained: integer({
        validation: { isRequired: true },
        defaultValue: 0,
      }),

      clientSatisfaction: integer({
        validation: { 
          isRequired: true,
          min: 0,
          max: 100
        },
        defaultValue: 0,
        ui: {
          description: 'Client satisfaction rate (0-100%)'
        }
      }),

      yearsOfExperience: integer({
        validation: { 
          isRequired: true,
          min: 0
        },
        defaultValue: 0,
        ui: {
          description: 'Years of experience in the field'
        }
      }),

      trainedFirefighters: integer({
        validation: { 
          isRequired: true,
          min: 0
        },
        defaultValue: 0,
        ui: {
          description: 'Total number of firefighters trained'
        }
      }),

      successRate: integer({
        validation: { 
          isRequired: true,
          min: 0,
          max: 100
        },
        defaultValue: 0,
        ui: {
          description: 'Program success rate (0-100%)'
        }
      }),

      createdAt: timestamp({
        defaultValue: { kind: "now" },
      }),

      updatedAt: timestamp({
        defaultValue: { kind: "now" },
      }),
    },

    ui: {
      labelField: "name",
      listView: {
        initialColumns: [
          "name",
          "groupsTrained",
          "clientSatisfaction",
          "yearsOfExperience",
          "trainedFirefighters",
          "successRate",
        ],
      },
    },
  }),
 TeamMember: list({
    access: allowAll,
    fields: {
      avatar: image({storage:'local_image_storage'}),
      name: text({ validation: { isRequired: true } }),
      title: text({
      hooks: {
        resolveInput: ({ resolvedData }) => {
          if (resolvedData.title) {
            const words = resolvedData.title.split(/\s+/);
            return words.slice(0, 2).join(' ');
          }
          return resolvedData.title;
        },
      },
      ui: {
        description: 'Maximum 2 words allowed',
      },
    }),
      roleDescription: text({
      ui: { displayMode: 'textarea', description: 'Maximum 20 words allowed' },
      hooks: {
        resolveInput: ({ resolvedData }) => {
          if (resolvedData.roleDescription) {
            const words = resolvedData.roleDescription.split(/\s+/);
            return words.slice(0, 20).join(' ');
          }
          return resolvedData.roleDescription;
        },
      },
    }),
    }
  })
} satisfies Lists
