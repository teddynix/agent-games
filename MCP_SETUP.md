# 🔌 MCP (Model Context Protocol) Setup for Raydium Documentation

## What is This?

This configures the AI assistant (me!) to have direct access to Raydium's official documentation, making me an expert on:
- Raydium SDK V2
- CPMM (Constant Product Market Maker) pools
- CLMM (Concentrated Liquidity Market Maker) pools  
- Swap/trading APIs
- Liquidity provision
- Pool creation

## Configuration Options

### Option 1: Cursor MCP Config (✅ Already Created)

I've created `.cursor/mcp_config.json` for you. This should work if Cursor supports GitBook MCP servers.

### Option 2: Global Cursor Settings

Add to your Cursor settings.json:

1. Press `Ctrl+Shift+P` (Windows) or `Cmd+Shift+P` (Mac)
2. Type: **"Preferences: Open User Settings (JSON)"**
3. Add:

```json
{
  "mcp.servers": {
    "raydium": {
      "url": "https://docs.raydium.io/raydium/~gitbook/mcp",
      "type": "sse"
    }
  }
}
```

### Option 3: Manual Reference Method (Fallback)

If MCP isn't working, you can manually reference the docs:

```
@https://docs.raydium.io/raydium/trading
@https://docs.raydium.io/raydium/liquidity
@https://docs.raydium.io/raydium/sdk
```

## Testing the MCP Connection

After configuration, test by asking:

1. **"How do I create a swap transaction with Raydium SDK V2?"**
2. **"What's the difference between CPMM and CLMM pools?"**
3. **"Show me how to fetch pool info from Raydium"**

If I can access the MCP server, my responses will be much more detailed and accurate with direct quotes from the docs.

## Verifying the Endpoint

To check if the MCP endpoint is active, visit in your browser:
```
https://docs.raydium.io/raydium/~gitbook/mcp
```

You should see either:
- A JSON manifest describing available tools/resources
- A "Not Found" error (meaning MCP might not be public yet)
- A redirect to the main documentation

## Alternative: Using Raydium SDK Documentation Directly

If the MCP server isn't accessible, here are the key documentation sources:

### Official Raydium Docs
- **Main Docs**: https://docs.raydium.io/
- **SDK V2 Guide**: https://docs.raydium.io/raydium/sdk
- **Trading**: https://docs.raydium.io/raydium/trading
- **Liquidity**: https://docs.raydium.io/raydium/liquidity

### GitHub Resources
- **Raydium SDK V2**: https://github.com/raydium-io/raydium-sdk-V2
- **Raydium Frontend**: https://github.com/raydium-io/raydium-frontend
- **SDK V2 Examples**: https://github.com/raydium-io/raydium-sdk-V2-demo

### NPM Package
```bash
npm install @raydium-io/raydium-sdk-v2
```

## What You Get with MCP Access

When the MCP server is configured, I can:

✅ **Real-time access** to latest Raydium documentation
✅ **Search** through all SDK methods and APIs
✅ **Code examples** directly from official docs
✅ **Type definitions** and interfaces
✅ **Best practices** for trading and liquidity
✅ **Pool configurations** and parameters
✅ **Transaction building** examples

## Troubleshooting

### "Cannot connect to MCP server"
→ The endpoint might not be publicly accessible yet
→ Try the manual reference method instead
→ Check if you need authentication

### "MCP server not responding"
→ Restart Cursor completely
→ Check your internet connection
→ Verify the URL is correct

### "No tools available from MCP"
→ The server might not expose tools, only documentation
→ This is fine - I can still read the docs

## Next Steps

1. **Restart Cursor** after adding MCP configuration
2. **Test the connection** by asking Raydium-specific questions
3. **Try integrating real Raydium SDK** in your Agent-Games project
4. **Reference specific docs** with @ mentions if MCP doesn't work

---

**Status**: Configuration file created at `.cursor/mcp_config.json`

**Test it**: Ask me: "What are the main functions in Raydium SDK V2 for swapping tokens?"


