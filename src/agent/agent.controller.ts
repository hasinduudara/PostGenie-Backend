import { Controller, Post, Body } from '@nestjs/common';
import { AgentService } from './agent.service';

@Controller('agent')
export class AgentController {
  constructor(private readonly agentService: AgentService) {}

  @Post('generate')
  async generatePost(@Body('topic') topic: string) {
    if (!topic) {
      return { error: 'Topic is required!' };
    }

    const generatedPost = await this.agentService.generateLinkedInPost(topic);

    return {
      success: true,
      data: generatedPost,
    };
  }
}
