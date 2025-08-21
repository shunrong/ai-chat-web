// 联网搜索功能
import { tavily, TavilyClient } from "@tavily/core";

// 搜索结果类型
export interface SearchResult {
  title: string;
  url: string;
  snippet: string;
  publishedDate?: string;
}

export interface SearchResponse {
  results: SearchResult[];
  query: string;
  total: number;
}

// 联网搜索服务类
export class WebSearchService {
  private tavilyClient?: TavilyClient;
  private searchEngine: "tavily" | "serper" | "duckduckgo";
  private apiKey?: string;

  constructor() {
    // 优先级：Tavily(官方SDK) > Serper > DuckDuckGo(免费)
    if (process.env.TAVILY_API_KEY) {
      this.searchEngine = "tavily";
      this.apiKey = process.env.TAVILY_API_KEY;
      this.tavilyClient = tavily({ apiKey: this.apiKey });
    } else if (process.env.SERPER_API_KEY) {
      this.searchEngine = "serper";
      this.apiKey = process.env.SERPER_API_KEY;
    } else {
      this.searchEngine = "duckduckgo";
      console.log(
        "[INFO] 使用免费的 DuckDuckGo 搜索，建议配置 TAVILY_API_KEY 获得更好的搜索结果"
      );
    }
  }

  async search(
    query: string,
    maxResults: number = 10
  ): Promise<SearchResponse> {
    try {
      console.log(`[DEBUG] 开始搜索: ${query}, 引擎: ${this.searchEngine}`);

      switch (this.searchEngine) {
        case "tavily":
          return await this.searchWithTavily(query, maxResults);
        case "serper":
          return await this.searchWithSerper(query, maxResults);
        case "duckduckgo":
          return await this.searchWithDuckDuckGo(query, maxResults);
        default:
          throw new Error("不支持的搜索引擎");
      }
    } catch (error) {
      console.error(`${this.searchEngine} 搜索失败:`, error);

      // 返回错误提示而不是抛出异常，避免影响正常聊天
      return {
        results: [
          {
            title: "搜索服务暂时不可用",
            url: "#",
            snippet: `搜索"${query}"时遇到问题: ${
              error instanceof Error ? error.message : "未知错误"
            }。请稍后重试或联系管理员配置搜索API。`,
          },
        ],
        query,
        total: 0,
      };
    }
  }

  // 使用 Tavily 官方 SDK 搜索
  private async searchWithTavily(
    query: string,
    maxResults: number
  ): Promise<SearchResponse> {
    if (!this.tavilyClient) {
      throw new Error("Tavily 客户端未初始化");
    }

    const response = await this.tavilyClient.search(query, {
      maxResults: maxResults,
      searchDepth: "basic",
      includeAnswer: false,
      includeRawContent: false,
    });

    console.log("[DEBUG] Tavily 搜索结果:", response);

    const results: SearchResult[] = (response.results || []).map(
      (item: any) => ({
        title: item.title,
        url: item.url,
        snippet: item.content,
        publishedDate: item.published_date,
      })
    );

    return {
      results,
      query,
      total: results.length,
    };
  }

  // 使用 Serper API 搜索
  private async searchWithSerper(
    query: string,
    maxResults: number
  ): Promise<SearchResponse> {
    if (!this.apiKey) {
      throw new Error("Serper API Key 未配置");
    }

    const response = await fetch("https://google.serper.dev/search", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-API-KEY": this.apiKey,
      },
      body: JSON.stringify({
        q: query,
        num: maxResults,
      }),
    });

    if (!response.ok) {
      throw new Error(`Serper 搜索失败: ${response.status}`);
    }

    const data = await response.json();
    const results: SearchResult[] = (data.organic || []).map((item: any) => ({
      title: item.title,
      url: item.link,
      snippet: item.snippet,
    }));

    return {
      results,
      query,
      total: results.length,
    };
  }

  // 使用 DuckDuckGo 免费搜索
  private async searchWithDuckDuckGo(
    query: string,
    maxResults: number
  ): Promise<SearchResponse> {
    const encodedQuery = encodeURIComponent(query);
    const response = await fetch(
      `https://api.duckduckgo.com/?q=${encodedQuery}&format=json&no_redirect=1&no_html=1&skip_disambig=1`,
      {
        headers: {
          "User-Agent": "Mozilla/5.0 (compatible; AI-Chat-Bot/1.0)",
        },
      }
    );

    if (!response.ok) {
      throw new Error(`DuckDuckGo 搜索失败: ${response.status}`);
    }

    const data = await response.json();
    return this.processDuckDuckGoResponse(data, query, maxResults);
  }

  private processDuckDuckGoResponse(
    data: any,
    query: string,
    maxResults: number
  ): SearchResponse {
    const results: SearchResult[] = [];

    // 处理相关主题
    if (data.RelatedTopics && Array.isArray(data.RelatedTopics)) {
      data.RelatedTopics.slice(0, maxResults).forEach((item: any) => {
        if (item.FirstURL && item.Text) {
          results.push({
            title: this.extractTitle(item.Text),
            url: item.FirstURL,
            snippet: item.Text,
          });
        }
      });
    }

    // 如果没有相关主题，使用摘要信息
    if (results.length === 0 && data.Abstract) {
      results.push({
        title: data.Heading || `关于"${query}"的信息`,
        url: data.AbstractURL || data.AbstractSource || "#",
        snippet: data.Abstract,
      });
    }

    // 如果还是没有结果，添加一个默认结果
    if (results.length === 0) {
      results.push({
        title: `"${query}"搜索结果`,
        url: `https://duckduckgo.com/?q=${encodeURIComponent(query)}`,
        snippet: `没有找到直接匹配的结果，建议配置 TAVILY_API_KEY 获得更好的搜索体验。`,
      });
    }

    return {
      results,
      query,
      total: results.length,
    };
  }

  private extractTitle(text: string): string {
    const parts = text.split(" - ");
    if (parts.length > 1) {
      return parts[0].trim();
    }
    return text.length > 60 ? text.substring(0, 60) + "..." : text;
  }

  // 生成搜索上下文供 AI 参考
  formatSearchContext(searchResponse: SearchResponse): string {
    const { results, query } = searchResponse;

    let context = `搜索查询: "${query}"\n\n以下是相关的搜索结果:\n\n`;

    results.forEach((result, index) => {
      context += `${index + 1}. ${result.title}\n`;
      context += `   链接: ${result.url}\n`;
      context += `   摘要: ${result.snippet}\n`;
      if (result.publishedDate) {
        context += `   发布时间: ${result.publishedDate}\n`;
      }
      context += "\n";
    });

    context += "请基于以上搜索结果回答用户的问题，并在回答中引用相关的链接。";

    return context;
  }
}
