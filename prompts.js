// prompts.js

const prompts = [
    // prompt #1
    `
    ### Task
    Generate a concise but intriguing blog post title about: {{topic}}. 

    ### Output
    Respond in strict JSON format: 
    {'title': '<title>'}
    `,
    
    // prompt #2
    `
    ### Task
    Create a comprehensive hoook base on the blog post title
    {{output[-1].title}}

    ### Instructions
    Think laterally and creatively.
    Use adjacent topics to create the hook.

    ### Style and Tone
    Write as a professional thought leader.
    Be authoritative and original.
    Avoid jargon and idioms.
    
    ### Output
    Respond ONLY with a JSON object in this exact format, nothing else: 
    {'outline': '<the outline text>'}
    `,

    // prompt #3
    `
    ### Task
    Based on the BLOG_TITLE and BLOG_OUTLINE, create 3 alternative paragraphs for a blog post.

    ### Style and Tone
    - Write as a professional thought leader.
    - Be authoritative and original.
    -  Avoid jargon and idioms.
    - Use exaple content below as a reference

    ### Input
    BLOG_TITLE:
    {{output[-2].title}}

    BLOG_OUTLINE:
    {{output[-1].outline}}

    ### Output
    Respond ONLY with a JSON object in this exact format, nothing else: 
    <!-- Repeat for each alternative-->
    {'paragraph 1': '<text for paragraph 1>', 'paragraph 2': '<text for paragraph 2>', 'paragraph 3': '<text for paragraph 3>'}
    `
];

export default prompts;
