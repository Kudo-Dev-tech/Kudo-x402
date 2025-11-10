import {
  character
} from "../chunk-UTSOZFKS.js";

// e2e/starter-plugin.test.ts
var StarterTestSuite = class {
  name = "starter";
  description = "E2E tests for the starter project";
  tests = [
    {
      name: "Character configuration test",
      fn: async (runtime) => {
        const requiredFields = ["name", "bio", "plugins", "system", "messageExamples"];
        const missingFields = requiredFields.filter((field) => !(field in character));
        if (missingFields.length > 0) {
          throw new Error(`Missing required fields: ${missingFields.join(", ")}`);
        }
        if (character.name !== "Eliza") {
          throw new Error(`Expected character name to be 'Eliza', got '${character.name}'`);
        }
        if (!Array.isArray(character.plugins)) {
          throw new Error("Character plugins should be an array");
        }
        if (!character.system) {
          throw new Error("Character system prompt is required");
        }
        if (!Array.isArray(character.bio)) {
          throw new Error("Character bio should be an array");
        }
        if (!Array.isArray(character.messageExamples)) {
          throw new Error("Character message examples should be an array");
        }
      }
    },
    {
      name: "Plugin initialization test",
      fn: async (runtime) => {
        try {
          await runtime.registerPlugin({
            name: "starter",
            description: "A starter plugin for Eliza",
            init: async () => {
            },
            config: {}
          });
        } catch (error) {
          throw new Error(`Failed to register plugin: ${error.message}`);
        }
      }
    },
    {
      name: "Hello world action test",
      fn: async (runtime) => {
        const message = {
          entityId: uuidv4(),
          roomId: uuidv4(),
          content: {
            text: "Can you say hello?",
            source: "test",
            actions: ["HELLO_WORLD"]
            // Explicitly request the HELLO_WORLD action
          }
        };
        const state = {
          values: {},
          data: {},
          text: ""
        };
        let responseReceived = false;
        try {
          await runtime.processActions(message, [], state, async (content) => {
            if (content.text === "hello world!" && content.actions?.includes("HELLO_WORLD")) {
              responseReceived = true;
            }
            return [];
          });
          if (!responseReceived) {
            const helloWorldAction = runtime.actions.find((a) => a.name === "HELLO_WORLD");
            if (helloWorldAction) {
              await helloWorldAction.handler(
                runtime,
                message,
                state,
                {},
                async (content) => {
                  if (content.text === "hello world!" && content.actions?.includes("HELLO_WORLD")) {
                    responseReceived = true;
                  }
                  return [];
                },
                []
              );
            } else {
              throw new Error("HELLO_WORLD action not found in runtime.actions");
            }
          }
          if (!responseReceived) {
            throw new Error("Hello world action did not produce expected response");
          }
        } catch (error) {
          throw new Error(`Hello world action test failed: ${error.message}`);
        }
      }
    },
    {
      name: "Hello world provider test",
      fn: async (runtime) => {
        const message = {
          entityId: uuidv4(),
          roomId: uuidv4(),
          content: {
            text: "What can you provide?",
            source: "test"
          }
        };
        const state = {
          values: {},
          data: {},
          text: ""
        };
        try {
          if (!runtime.providers || runtime.providers.length === 0) {
            throw new Error("No providers found in runtime");
          }
          const helloWorldProvider = runtime.providers.find(
            (p) => p.name === "HELLO_WORLD_PROVIDER"
          );
          if (!helloWorldProvider) {
            throw new Error("HELLO_WORLD_PROVIDER not found in runtime providers");
          }
          const result = await helloWorldProvider.get(runtime, message, state);
          if (result.text !== "I am a provider") {
            throw new Error(`Expected provider to return "I am a provider", got "${result.text}"`);
          }
        } catch (error) {
          throw new Error(`Hello world provider test failed: ${error.message}`);
        }
      }
    },
    {
      name: "Starter service test",
      fn: async (runtime) => {
        try {
          const service = runtime.getService("starter");
          if (!service) {
            throw new Error("Starter service not found");
          }
          if (service.capabilityDescription !== "This is a starter service which is attached to the agent through the starter plugin.") {
            throw new Error("Incorrect service capability description");
          }
          await service.stop();
        } catch (error) {
          throw new Error(`Starter service test failed: ${error.message}`);
        }
      }
    }
  ];
};
var starter_plugin_test_default = new StarterTestSuite();
export {
  StarterTestSuite,
  starter_plugin_test_default as default
};
//# sourceMappingURL=starter-plugin.test.js.map