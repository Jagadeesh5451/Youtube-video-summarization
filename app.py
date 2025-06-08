from flask import Flask, request, jsonify
from youtube_transcript_api import YouTubeTranscriptApi
import google.generativeai as genai
from flask_cors import CORS

# Flask app setup
app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Configure Google Gemini API key
genai.configure(api_key='AIzaSyD0Wru_ASiHtcLdkzK246pU2RWALgoRBlw')  # Replace with your Google API Key

# Function to extract transcript details from YouTube
@app.route('/transcript', methods=['GET'])
def get_transcript():
    youtube_video_url = request.args.get('url')
    try:
        video_id = youtube_video_url.split("=")[1]
        transcript_list = YouTubeTranscriptApi.get_transcript(video_id, languages=['en'])
        transcript = " ".join([entry["text"] for entry in transcript_list])
        return jsonify({'transcript': transcript, 'video_id': video_id})
    except Exception as e:
        return jsonify({'error': str(e)}), 400

# Function to generate summary using Google Gemini 
@app.route('/summary', methods=['POST'])
def generate_summary():
    data = request.json
    transcript_text = data.get('transcript')
    
    # New structured prompt for well-defined summary with headings and points
    structured_prompt = ("""You are a YouTube video summarizer. You will be taking the transcript text
                            and summarizing the entire video and providing the important summary in points
                            within 500 words. Please provide the summary of the text given here:  """
                         f"Here is the transcript:\n\n{transcript_text}")

    try:
        model = genai.GenerativeModel("gemini-2.0-flash")
        response = model.generate_content(structured_prompt)
        return jsonify({'summary': response.text})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(port=5001, debug=True)  
