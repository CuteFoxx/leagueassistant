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
    const prompt = `Give me just link to the recent replay of matchup ${matchup.user.champion} vs ${matchup.opponent.champion}  on ${matchup.user.role} lane. You should  not type any text just provide one link`;

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
