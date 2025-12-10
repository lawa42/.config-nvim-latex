# Implementation Plan: Neovim Recipe Execution with Sidebar Prompt

## Overview

This plan details the implementation of a new feature that allows users to select a Goose recipe in Neovim, enter a prompt in the Goose sidebar, and then execute the recipe with the provided prompt. This will be triggered by the `<leader>aj` keymapping.

## Research Summary

- **Recipes**: Goose recipes are defined as YAML files located in project-local (`.goose/recipes/`) or global (`~/.config/goose/recipes/`) directories. They specify parameters and a prompt template for the AI model.
- **Neovim Integration**: The `azorng/goose.nvim` plugin provides the core Neovim integration, including the sidebar UI (`:Goose`).
- **Recipe Picker**: A Telescope-based picker, invoked with `:GooseRecipes`, allows users to select a recipe.
- **Execution Flow**: When a recipe is selected, the `execution.run_recipe_in_sidebar` function is called. This function currently uses `vim.fn.input()` to prompt the user for any required parameters and then executes the recipe using a `goose run` command.
- **Key Challenge**: The current implementation uses a blocking, command-line-style prompt (`vim.fn.input()`). The core of this feature is to replace this with a more interactive flow using the Goose sidebar for the main user prompt.

## Success Criteria

- Pressing `<leader>aj` opens the Telescope recipe picker.
- After selecting a recipe, the Goose sidebar opens with the cursor in the input window.
- The user can type their prompt into the input window.
- After submitting the prompt (e.g., by pressing Enter), the recipe is executed.
- Any other required parameters (not marked as `user_prompt`) are collected using `vim.fn.input()` before the sidebar opens.
- The output of the recipe is streamed to the Goose sidebar's output window.

## Implementation Phases

### Phase 1: Keymap and New Execution Function

**Objective**: Create the entry point for the new workflow (`<leader>aj`) and a new execution function that will handle the sidebar-based prompting.

**Tasks**:

1.  **Create Keymap**: In the appropriate Neovim configuration file (likely in `nvim/lua/neotex/config/keymaps.lua` or a similar location where which-key is configured), add a keymap for `<leader>aj` that calls a new function, e.g., `require('neotex.plugins.ai.goose.picker').show_recipe_picker_with_sidebar_prompt()`.
2.  **Create New Picker Function**: In `nvim/lua/neotex/plugins/ai/goose/picker/init.lua`, create the new function `show_recipe_picker_with_sidebar_prompt`. This function will be a wrapper around the existing `show_recipe_picker` but will configure it to use a new execution function upon selection.
3.  **Create New Execution Function**: In `nvim/lua/neotex/plugins/ai/goose/picker/execution.lua`, create a new function `run_recipe_with_sidebar_prompt`. This function will be similar to `run_recipe_in_sidebar` but will be modified to handle the sidebar prompt. Initially, this function can just be a copy of the existing one.

**Testing**:

- Verify that pressing `<leader>aj` opens the recipe picker.
- Verify that selecting a recipe calls the new `run_recipe_with_sidebar_prompt` function. For now, it should behave identically to the old function (i.e., use `vim.fn.input()` for all prompts).

### Phase 2: Sidebar Prompting Logic

**Objective**: Modify the parameter collection logic to use the Goose sidebar for the main prompt.

**Tasks**:

1.  **Separate Parameter Prompting**: In `execution.lua`, create a new function, e.g., `prompt_for_parameters_cli`, that contains the existing `vim.fn.input()` logic.
2.  **Modify `run_recipe_with_sidebar_prompt`**:
    - This function will first call `prompt_for_parameters_cli` to collect all parameters *except* the one marked with `requirement: user_prompt`.
    - After collecting the other parameters, it will open the Goose sidebar using `require('goose.core').open()`.
    - It will then need to capture the user's input from the sidebar's input buffer. This will likely involve creating an `autocmd` that listens for a specific event (like `BufWriteCmd` or a custom event) on the `goose-input` buffer.
3.  **Update Recipe Execution**: Once the prompt is captured from the sidebar, the function will combine it with the previously collected parameters and execute the `goose run` command, streaming the output to the sidebar.

**Testing**:

- When selecting a recipe with multiple parameters, the function should first prompt for the non-`user_prompt` parameters via the command line.
- After that, the Goose sidebar should open.
- Typing in the sidebar's input window and saving/submitting it should trigger the recipe execution.

### Phase 3: Integration and Refinement

**Objective**: Ensure the new workflow is smooth and provides good user feedback.

**Tasks**:

1.  **User Feedback**: Add `vim.notify` messages to guide the user through the process (e.g., "Enter your prompt in the sidebar and press <CR> to submit.").
2.  **Error Handling**: Implement robust error handling. For example, what happens if the user closes the sidebar before entering a prompt? The workflow should be gracefully cancelled.
3.  **Code Cleanup**: Refactor the code to remove any duplication between the old and new execution functions. It might be possible to have a single `run_recipe` function that takes a parameter to determine the prompting method.
4.  **Documentation**: Add comments to the new functions explaining how the sidebar prompting works. Update the `README.md` for the `goose` plugin to document the new keymap and workflow.

**Testing**:

- Test with recipes that have no parameters, only a `user_prompt` parameter, and multiple parameters.
- Test cancelling the workflow at various stages (closing the picker, cancelling a `vim.fn.input` prompt, closing the sidebar).
- Verify that the user notifications are clear and helpful.

## Dependencies

- **Telescope.nvim**: Required for the recipe picker.
- **azorng/goose.nvim**: The core Goose Neovim plugin.
- **plenary.nvim**: A dependency of both Telescope and `goose.nvim`.
