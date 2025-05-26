-- return {
--   "ellisonleao/gruvbox.nvim",
--   priority = 1000, -- make sure to load this before all the other start plugins
--   config = function()
--     require("gruvbox").setup({
--       overrides = {
--         -- THIS BLOCK
--         SignColumn = { bg = "#282828" },
--         NvimTreeCutHL = { fg = "#fb4934", bg = "#282828" },
--         NvimTreeCopiedHL = { fg = "#b8bb26", bg = "#282828" },
--         DiagnosticSignError = { fg = "#fb4934", bg = "#282828" },
--         DiagnosticSignWarn = { fg = "#fabd2f", bg = "#282828" },
--         DiagnosticSignHint = { fg = "#8ec07c", bg = "#282828" },
--         DiagnosticSignInfo = { fg = "#d3869b", bg = "#282828" },
--         -- OR THIS BLOCK
--         -- NvimTreeCutHL = { fg="#fb4934", bg="#3c3836" },
--         -- NvimTreeCopiedHL = { fg="#b8bb26", bg="#3c3836" }
--         -- END
--       }
--     })
--     vim.cmd("colorscheme gruvbox")
--   end,
-- }

-- -- MONOKAI
-- return {
--   "tanvirtin/monokai.nvim",  -- Monokai theme
--   priority = 1000, -- make sure to load this before all the other start plugins
--   config = function()
--     require("monokai").setup {
--       -- palette = require("monokai").pro,  -- Use Monokai Pro palette
--     }
--   vim.cmd("colorscheme monokai")
--   end
-- }

-- -- KANAGAWA
-- return {
--   "rebelot/kanagawa.nvim",
--   priority = 1000, -- make sure to load this before all the other start plugins
--   config = function()
--     require('kanagawa').setup({
--       compile = false,  -- enable compiling the colorscheme
--       undercurl = true, -- enable undercurls
--       commentStyle = { italic = true },
--       functionStyle = {},
--       keywordStyle = { italic = true },
--       statementStyle = { bold = true },
--       typeStyle = {},
--       transparent = false,   -- do not set background color
--       dimInactive = false,   -- dim inactive window `:h hl-NormalNC`
--       terminalColors = true, -- define vim.g.terminal_color_{0,17}
--       colors = {
--         -- add/modify theme and palette colors
--         palette = {},
--         theme = { wave = {}, lotus = {}, dragon = {}, all = {} },
--       },
--       overrides = function(colors) -- add/modify highlights
--         return {}
--       end,
--       theme = "wave", -- Load "wave" theme when 'background' option is not set
--       background = {
--         -- map the value of 'background' option to a theme
--         dark = "wave", -- try "dragon" !
--         light = "lotus"
--       },
--     })
--     vim.cmd("colorscheme kanagawa") -- setup must be called before loading
--   end,
-- }



-- -- NIGHTFLY
-- return {
--   "bluz71/vim-nightfly-guicolors",
--   priority = 1000, -- make sure to load this before all the other start plugins
--   config = function()
--     -- load the colorscheme here
--     vim.cmd("colorscheme nightfly")
--   end,
-- }


-- OTHER
-- "luisiacc/gruvbox-baby"
-- "folke/tokyonight.nvim"
-- "lunarvim/darkplus.nvim"
-- "navarasu/onedark.nvim"
-- "savq/melange"
-- "EdenEast/nightfox.nvim"
--
-- My own Version of catppucino
-- Config from https://github.com/catppuccin/nvim 
-- Activated the config only partly for things I might need
return {
  "catppuccin/nvim",
  priority = 1000,
  name = "catppuccin",
  config = function ()
    require("catppuccin").setup({
      flavour = "machiato", -- latte, frappe, macchiato, mocha
      background = { -- :h background
        light = "latte",
        dark = "mocha",
      },
      transparent_background = true, -- disables setting the background color.
--       show_end_of_buffer = false, -- shows the '~' characters after the end of buffers
--       term_colors = false, -- sets terminal colors (e.g. `g:terminal_color_0`)
      dim_inactive = {
        enabled = false, -- dims the background color of inactive window
        shade = "dark",
        percentage = 0.15, -- percentage of the shade to apply to the inactive window
      },
--       no_italic = false, -- Force no italic
--       no_bold = false, -- Force no bold
--       no_underline = false, -- Force no underline
--       styles = { -- Handles the styles of general hi groups (see `:h highlight-args`):
--         comments = { "italic" }, -- Change the style of comments
--         conditionals = { "italic" },
--         loops = {},
--         functions = {},
--         keywords = {},
--         strings = {},
--         variables = {},
--         numbers = {},
--         booleans = {},
--         properties = {},
--         types = {},
--         operators = {},
--         -- miscs = {}, -- Uncomment to turn off hard-coded styles
--       },
--       color_overrides = {},
--       custom_highlights = {},
      integrations = {
        cmp = true,
--         gitsigns = true,
--         nvimtree = true,
        treesitter = true,
--         notify = false,
--         mini = {
--           enabled = true,
--           indentscope_color = "",
        },
--         -- For more plugins integrations please scroll down (https://github.com/catppuccin/nvim#integrations)
--       },
    })
--  vim.cmd("colorscheme catppuccin")
 end,
}

-- setup must be called before loading
-- vim.cmd.colorscheme "catppuccin"
--
