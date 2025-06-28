import axios from "axios";
import type { Matchup } from "../interfaces/Matchup";

export class Gemini {
  private apiKey: string;

  private baseUrl: string =
    "https://generativelanguage.googleapis.com/v1beta/models";

  private model: string = "gemini-2.0-flash";

  constructor(apiKey: string, model: string | null = null) {
    this.apiKey = apiKey;
    this.model = model != null ? model : this.model;
  }

  private getUrl(): string {
    return `${this.baseUrl}/${this.model}:generateContent?key=${this.apiKey}`;
  }

  public async getVideoAboutMatchup(matchup: Matchup) {
    const prompt = `@YouTube  ${matchup.user.champion} vs ${matchup.opponent.champion} League of legends provide recent video from search results. Dont type any text at all just give me  1 link. Provide only one link based on latest search results without any additional text. Order of champions should be preserved as i provided at the start`;

    const res = await axios.post(this.getUrl(), {
      contents: [
        {
          parts: [
            {
              text: prompt,
            },
          ],
        },
      ],
      tools: [
        {
          google_search: {},
        },
      ],
    });

    return res.data;
  }
}
