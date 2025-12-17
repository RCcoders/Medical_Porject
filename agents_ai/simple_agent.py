import re

class SimpleAgent:
    def __init__(self, tools, llm):
        self.tools = {tool.name.lower(): tool for tool in tools}
        self.llm = llm
        
    def run(self, query):
        print(f"Agent starting with query: {query}")
        
        # Simple ReAct Prompt
        prompt = f"""Answer the following questions as best you can. You have access to the following tools:

{self._render_tools()}

Use the following format:

Question: the input question you must answer
Thought: you should always think about what to do
Action: the action to take, should be one of [{self._render_tool_names()}]
Action Input: the input to the action
Observation: the result of the action
... (this Thought/Action/Action Input/Observation can repeat N times)
Thought: I now know the final answer
Final Answer: the final answer to the original input question

Begin!

Question: {query}
Thought:"""

        history = prompt
        
        for i in range(5): # Max 5 steps
            # Invoke LLM
            response = self.llm.invoke(history)
            content = response.content if hasattr(response, 'content') else str(response)
            
            print(f"\n[Step {i+1}] LLM Output:\n{content}")
            
            # Append to history
            history += content
            
            # Parse Action
            match = re.search(r"Action:\s*(.+?)\nAction Input:\s*(.+)", content, re.DOTALL)
            if "Final Answer:" in content:
                return content.split("Final Answer:")[-1].strip()
            
            if match:
                action = match.group(1).strip().lower()
                action_input = match.group(2).strip()
                
                print(f"Action found: {action} with input: {action_input}")
                
                tool = self.tools.get(action)
                if tool:
                    try:
                        observation = tool.func(action_input)
                    except Exception as e:
                        observation = f"Error: {e}"
                else:
                    observation = f"Error: Tool '{action}' not found. Available tools: {list(self.tools.keys())}"
                
                print(f"Observation: {observation}")
                
                history += f"\nObservation: {observation}\nThought:"
            else:
                # If no action found but no final answer, force a thought or stop
                if "Action:" not in content:
                    history += "\nThought:"
        
        return "Agent timed out or failed to find final answer."

    def _render_tools(self):
        return "\n".join([f"{t.name}: {t.description}" for t in self.tools.values()])
        
    def _render_tool_names(self):
        return ", ".join([t.name for t in self.tools.values()])
