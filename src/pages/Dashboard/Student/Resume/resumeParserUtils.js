export const parseResumeWithOpenAI = async (text) => {
  try {
    const prompt = `
    Extract the following information from this resume text and return as JSON:
    - career_objective
    - education (degree, stream, end_year, start_year, performance_type, performance_score, college_or_school_name)
    - work_experiences (type, profile, end_date, location, start_date, description, designation, organization, location_type, currently_working)
    - extra_curricular_activities (description)
    - trainings_courses (end_date, location, start_date, description, organization, location_type, training_program, currently_ongoing)
    - academic_projects (title, end_date, start_date, description, project_link, currently_ongoing)
    - skills (name)
    - portfolio_work_samples (url, name)
    - accomplishments (additional_details)
    - profile_details (first_name, last_name, email, phone_number, college_name, current_city)
    
    Here's the resume text:
    ${text}
    
    Return ONLY the JSON, no additional text or explanation.
    `;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
       headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer sk-7pWoqBgbu1sV2F1youDQEwJP1ONmTfVyzy20AsMKDTT3BlbkFJGhXrOLXy5gQnvorYxelH4_NzHhYsjiiih5P0XI47AA`
        },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.3
      })
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const jsonString = data.choices[0]?.message?.content;
    
    if (!jsonString) {
      throw new Error('No content returned from OpenAI');
    }

    // Clean the response to extract just the JSON
    const jsonStart = jsonString.indexOf('{');
    const jsonEnd = jsonString.lastIndexOf('}') + 1;
    
    if (jsonStart === -1 || jsonEnd === 0) {
      throw new Error('Invalid JSON format from OpenAI');
    }

    const cleanJson = jsonString.substring(jsonStart, jsonEnd);

    return JSON.parse(cleanJson);
    console.log('Parsed Resume Data:', parsedData);
  } catch (error) {
    console.error('OpenAI Parsing Error:', error);
    throw new Error('Failed to parse resume content. Please try again.');
  }
};