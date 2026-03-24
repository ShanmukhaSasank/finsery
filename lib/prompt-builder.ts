export function buildPrompt(data: any): string {
  const {
    story_hook, key_takeaway, finsery_pro_tip, accordion,
    content_specification, intent,
    title, primary_keyword, angle, reference_links,
    avoid, brand_mention, tone, target_audience, word_count
  } = data

  const storyHookBlock = `<!-- wp:acf/story-hook {"name":"acf/story-hook","data":{"story_hook_title":"GENERATE_TITLE","_story_hook_title":"field_68dc8cb37ea38","story_hook_content":"GENERATE_CONTENT","_story_hook_content":"field_68dc8ce17ea39","story_hook_enable_share":"1","_story_hook_enable_share":"field_68e366eecfcd1","story_hook_share_text":"GENERATE_SHARE_TEXT","_story_hook_share_text":"field_68e367f2cfcd2","story_hook_social_share_text":"GENERATE_SOCIAL_SHARE_TEXT","_story_hook_social_share_text":"field_68e367f2cfcd2_alt","story_hook_read_time":"GENERATE_READ_TIME","_story_hook_read_time":"field_68dce29a8ce56","story_hook_enable_hover_effect":"1","_story_hook_enable_hover_effect":"field_68e4fe07ca806","story_hook_enable_icon_glow":"0","_story_hook_enable_icon_glow":"field_68ed01a303124","story_hook_light_image":"","_story_hook_light_image":"field_68ec906c4be2c","story_hook_enable_dark_mode_image":"1","_story_hook_enable_dark_mode_image":"field_68edarkmode_toggle","story_hook_dark_image":"","_story_hook_dark_image":"field_68eca942876e9"},"mode":"edit"} /-->`

  const keyTakeawayBlock = `<!-- wp:acf/quick-takeaway {"name":"acf/quick-takeaway","data":{"quick_takeaway_title":"Key Takeaways","_quick_takeaway_title":"field_68e363fe79463","quick_takeaway_points_0_point_text":"POINT_1","_quick_takeaway_points_0_point_text":"field_6981b4db69d48","quick_takeaway_points_1_point_text":"POINT_2","_quick_takeaway_points_1_point_text":"field_6981b4db69d48","quick_takeaway_points_2_point_text":"POINT_3","_quick_takeaway_points_2_point_text":"field_6981b4db69d48","quick_takeaway_points":3,"_quick_takeaway_points":"field_68e3642079464","quick_takeaway_show_summary":"1","_quick_takeaway_show_summary":"field_68e3643e79465","quick_takeaway_enable_hover_effect":"0","_quick_takeaway_enable_hover_effect":"field_68e36ed940ff5"},"mode":"edit"} /-->`

  const proTipBlock = `<!-- wp:acf/pro-tip {"name":"acf/pro-tip","data":{"pro_tip_title":"Finsery pro tip","_pro_tip_title":"field_68d6a4068682c","pro_tip_content":"WRITE_THE_INSIGHT_HERE","_pro_tip_content":"field_68d6a4248682d","pro_tip_enable_hover_effect":"0","_pro_tip_enable_hover_effect":"field_68e4bf42a0f31"},"mode":"edit"} /-->`

  const accordionExampleBlock = `<!-- wp:acf/accordion-section {"name":"acf/accordion-section","data":{"accordion_first_tab":"1","_accordion_first_tab":"field_6962062b2f5cc","accordion_items":2,"_accordion_items":"field_69291107d8067","accordion_items_0_accordion_title":"TITLE_1","_accordion_items_0_accordion_title":"field_6929113bd8068","accordion_items_0_accordion_content":"CONTENT_1","_accordion_items_0_accordion_content":"field_69291161d8069","accordion_items_1_accordion_title":"TITLE_2","_accordion_items_1_accordion_title":"field_6929113bd8068","accordion_items_1_accordion_content":"CONTENT_2","_accordion_items_1_accordion_content":"field_69291161d8069"},"mode":"edit"} /-->`

  // Output blocks
  let outputBlocks = ''
  if (story_hook === 'yes') {
    const accordionReminder = accordion === 'yes' ? ' IMPORTANT: After the story hook block, when writing the article HTML body, you are FORBIDDEN from using any ul, li, or ol tags. Every list must be replaced with an accordion block exactly as instructed in the CRITICAL ACCORDION RULE below.' : ''
    outputBlocks = `YOUR OUTPUT MUST START WITH THIS BLOCK BEFORE ANY HTML CONTENT. OUTPUT THIS EXACT BLOCK FIRST: ${storyHookBlock} YOU MUST REPLACE: GENERATE_TITLE with a short problem-focused sentence related to the article topic. GENERATE_CONTENT with 2 to 4 paragraphs of a realistic US consumer narrative scenario only. GENERATE_SHARE_TEXT with a short teaser sentence. GENERATE_SOCIAL_SHARE_TEXT with a concise social share line. GENERATE_READ_TIME with an estimated read time. AFTER THIS BLOCK OUTPUT THE ARTICLE HTML BODY.${accordionReminder}`
  } else if (key_takeaway === 'yes') {
    outputBlocks = `YOUR OUTPUT MUST START WITH THIS BLOCK BEFORE ANY HTML CONTENT. OUTPUT THIS EXACT BLOCK FIRST: ${keyTakeawayBlock} YOU MUST REPLACE: POINT_1, POINT_2, POINT_3 with concise sentences summarizing the most important points. AFTER THIS BLOCK OUTPUT THE ARTICLE HTML BODY.`
  } else {
    outputBlocks = `Begin directly with the article HTML body. Do not generate any Story Hook or Quick Takeaway block.`
  }

  // Pro tip
  let proTipSection = ''
  if (finsery_pro_tip === 'yes') {
    proTipSection = `PRO TIP INSTRUCTIONS: You must include exactly ONE Pro Tip block in the article. Insert it at the END of the most relevant H2 section. The pro tip must provide a sharper operational or strategic insight. Writing rules: 2 to 4 sentences maximum, specific, practical, intelligent, no hype. OUTPUT THIS EXACT BLOCK ONCE IN THE ARTICLE: ${proTipBlock} REPLACE ONLY WRITE_THE_INSIGHT_HERE with the actual pro tip content.`
  }

  // Accordion
  let accordionSection = ''
  if (accordion === 'yes') {
    accordionSection = `CRITICAL ACCORDION RULE: You are FORBIDDEN from outputting any ul, li, or ol tags anywhere in this article. ACCORDION COUNT RULE: You must include exactly 2 to 4 accordion blocks in the entire article. Place each accordion block where grouped items would be most useful. Every TITLE_X must contain a real short label. Every CONTENT_X must contain a real full explanation. Each accordion must have between 3 to 6 items. OUTPUT THIS EXACT STRUCTURE for every accordion: ${accordionExampleBlock} REMINDER: No ul tags. No li tags. No ol tags. No placeholder text.`
  }

  // Content spec
  let contentSpecSection = ''
  if (content_specification === 'beginner') {
    contentSpecSection = `CONTENT SPECIFICATION: ABSOLUTE BEGINNER LEVEL. Write for a reader with zero financial knowledge. Use the simplest English possible. Every sentence must be short. Every paragraph must be short, maximum 3 sentences. Never use a financial term without immediately explaining it. Use everyday analogies. The tone must be warm, patient, and conversational. FOUNDATIONAL STRUCTURE RULE: H2 #1 explains the broader concept. H2 #2 defines the specific topic. H2 #3 onwards goes into depth.`
  } else {
    contentSpecSection = `CONTENT SPECIFICATION: MEDIUM TO ADVANCED LEVEL. Follow a progressive knowledge structure starting at medium and building toward advanced. Opening H2 sections: medium level. Middle sections: analytical and nuanced with trade-offs and lender perception. Final sections: fully advanced with strategic insight and optimization. Use precise financial terminology with enough context for a medium-knowledge reader.`
  }

  // Intent section
  let intentSection = ''
  if (intent === 'Commercial') {
    intentSection = `INTENT: COMMERCIAL. Include a clearly ranked numbered list of top products. Use real product names from reference links and general knowledge. Dedicate one H3 to each product covering standout feature, who it is best for, key benefit, and notable limitation. Include a comparison section. Do not fabricate rates or figures.`
  } else if (intent === 'Informational') {
    intentSection = `INTENT: INFORMATIONAL. Education first — at least 60 percent purely educational before any product mention. Mention products naturally in paragraphs only, never in ranked lists. Use reference links for accurate data points. Maintain a neutral analytical tone throughout.`
  } else if (intent === 'Transactional') {
    intentSection = `INTENT: TRANSACTIONAL. Structured around helping the reader take action right now. Include at least one numbered step-by-step process section. Mention real US financial institutions by name. Extract application steps and eligibility requirements from reference links. Address common obstacles and mistakes.`
  } else if (intent === 'Navigational') {
    intentSection = `INTENT: NAVIGATIONAL. Help the reader find the right product or category on Finsery. Mention Finsery up to three times. Structure around different reader profiles pointing each to the most relevant solution. Every section must give the reader a clear sense of direction.`
  }

  const articleRules = `ARTICLE STRUCTURE RULES: Do NOT create an H1 heading. INTRODUCTION RULE: Write one short introductory paragraph of 2 to 4 sentences before the first H2. HEADING UNIQUENESS RULE: Every H2 and H3 must be completely unique. Use Modified Title Case. HEADING PUNCTUATION RULE: Add a question mark to question-style headings only. SEO HEADING RULES: Every heading must include the primary keyword or a variation. H2 CONTENT LENGTH RULE: Maximum 2 to 3 paragraphs per H2 section. SUBHEADING RULE: Use H3 when content has multiple distinct points. Use H4 only under H3. BULLET POINT RULE: Mandatory in at least 2 sections. 3 to 6 items per list. EXAMPLES RULE: Include one concise real-world US-based example per section where it adds clarity. Do not fabricate statistics. Mention Finsery naturally no more than two times. EM DASH COMPLETE BAN: The em dash character is completely forbidden everywhere. Use commas or colons instead. Return clean HTML only using h2 h3 h4 p ul li ol tags. Do NOT include markdown. Do NOT include html or body tags. End the article with: <p>[EDITOR REVIEW REQUIRED]</p>`

  return `${outputBlocks} ${proTipSection} ${accordionSection} ${intentSection} ${contentSpecSection} ARTICLE TOPIC AND INPUTS: Title: ${title} Primary Keyword: ${primary_keyword} Intent: ${intent} Angle: ${angle} Reference Links: ${reference_links} Avoid: ${avoid} Brand Mention: ${brand_mention} Tone: ${tone} Target Audience: ${target_audience} Word Count Range: ${word_count} - this is a strict requirement, the article body must meet this word count. ${articleRules}`
}
