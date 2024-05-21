return {
  "neovim/nvim-lspconfig",
  event = { "BufReadPre", "BufNewFile" },
  dependencies = {
    { "hrsh7th/cmp-nvim-lsp" },
    { "antosha417/nvim-lsp-file-operations", config = true },
  },
  config = function()
    -- import lspconfig plugin
    local lspconfig = require("lspconfig")

    -- import cmp-nvim-lsp plugin
    local cmp_nvim_lsp = require("cmp_nvim_lsp")

    -- used to enable autocompletion (assign to every lsp server config)
    local default = cmp_nvim_lsp.default_capabilities()

    -- Change the Diagnostic symbols in the sign column (gutter)
    local signs = { Error = "", Warn = "", Hint = "󰠠", Info = "" }
    for type, icon in pairs(signs) do
      local hl = "DiagnosticSign" .. type
      vim.fn.sign_define(hl, { text = icon, texthl = hl, numhl = "" })
    end

    -- configure TexLab server
    lspconfig["texlab"].setup({
      capabilities = default,
      settings = {
        chktex = {
          onOpenAndSave = true,
          onEdit = true,
        },
      },
    })

    -- configure ltex-ls
    lspconfig["ltex"].setup({
      on_attach=on_attach,
      capabilities=capabilities,
    use_spellfile = false,
      filetypes = { "latex", "tex", "bib", "markdown", "gitcommit", "text" },
      settings = {
        ltex = {
          enabled = { "latex", "tex", "bib", "markdown", },
          language = "en-US",
          diagnosticSeverity = "information",
          sentenceCacheSize = 2000,
          additionalRules = {
            enablePickyRules = true,
            motherTongue = "de-AT",
          },
          disabledRules = {
              ["en"]    = { "MORFOLOGIK_RULE_EN"    },
              ["en-AU"] = { "MORFOLOGIK_RULE_EN_AU" },
              ["en-CA"] = { "MORFOLOGIK_RULE_EN_CA" },
              ["en-GB"] = { "MORFOLOGIK_RULE_EN_GB" },
              ["en-NZ"] = { "MORFOLOGIK_RULE_EN_NZ" },
              ["en-US"] = { "MORFOLOGIK_RULE_EN_US" },
              ["en-ZA"] = { "MORFOLOGIK_RULE_EN_ZA" },
              ["de"]    = { "MORFOLOGIK_RULE_DE_DE" },
          },
          dictionary = (function()
          -- For dictionary, search for files in the runtime to have
          -- and include them as externals the format for them is
          -- dict/{LANG}.txt
          --
          -- Also add dict/default.txt to all of them
          local files = {}
          for _, file in ipairs(vim.api.nvim_get_runtime_file("dict/*", true)) do
            local lang = vim.fn.fnamemodify(file, ":t:r")
            local fullpath = vim.fs.normalize(file, ":p")
            files[lang] = { ":" .. fullpath }
          end

          if files.default then
            for lang, _ in pairs(files) do
              if lang ~= "default" then
                vim.list_extend(files[lang], files.default)
              end
            end
            files.default = nil
          end
          return files
        end)(),
        },
      },
    })

    -- configure html server
    lspconfig["html"].setup({
      capabilities = default,
    })

    -- -- configure typescript server with plugin
    -- lspconfig["tsserver"].setup({
    --   capabilities = default,
    -- })

    -- -- configure emmet language server
    -- lspconfig["emmet_ls"].setup({
    --   capabilities = default,
    --   filetypes = { "html", "typescriptreact", "javascriptreact" }, -- , "css", "sass", "scss", "less", "svelte"
    -- })

    -- configure python server
    lspconfig["pyright"].setup({
      capabilities = default,
    })

    -- configure lua server (with special settings)
    lspconfig["lua_ls"].setup({
      capabilities = default,
      settings = {
                   -- custom settings for lua
        Lua = {
          -- make the language server recognize "vim" global
          diagnostics = {
            globals = { "vim" },
          },
          workspace = {
            -- make language server aware of runtime files
            library = {
              [vim.fn.expand("$VIMRUNTIME/lua")] = true,
              [vim.fn.stdpath("config") .. "/lua"] = true,
            },
          },
        },
      },
    })
  end,
}
