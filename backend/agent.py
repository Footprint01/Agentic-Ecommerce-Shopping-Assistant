from typing import TypedDict, Annotated, Sequence, Literal
import operator
from langchain_core.messages import BaseMessage, HumanMessage, AIMessage, ToolMessage
from langchain_openai import ChatOpenAI
from langchain_core.tools import tool
from langgraph.graph import StateGraph, END
from langgraph.prebuilt import ToolNode
import json
import requests

# Define Agent State
class AgentState(TypedDict):
    messages: Annotated[Sequence[BaseMessage], operator.add]

# --- Tools ---

@tool
def search_products(query: str):
    """
    Search for products in the catalog based on a query string.
    Use this tool when the user asks for specific items like 'laptops', 'shoes', etc.
    """
    print(f"DEBUG: Searching for {query}")
    try:
        # In a real scenario, this would query the Vector DB or the Product API
        # For this template, we'll hit the DummyJSON API directly
        response = requests.get(f"https://dummyjson.com/products/search?q={query}")
        data = response.json()
        products = data.get('products', [])[:5] # Limit to 5 for context window
        return json.dumps(products)
    except Exception as e:
        return f"Error searching products: {str(e)}"

@tool
def get_categories():
    """
    Get a list of available product categories.
    Use this tool when the user wants to know what kind of items are sold.
    """
    try:
        response = requests.get("https://dummyjson.com/products/categories")
        return json.dumps(response.json())
    except Exception as e:
        return f"Error fetching categories: {str(e)}"

# --- Graph Definition ---

def create_agent_graph():
    """
    Constructs the LangGraph agent workflow.
    """
    # Initialize LLM
    llm = ChatOpenAI(model="gpt-4-turbo", temperature=0)
    
    # Bind tools to LLM
    tools = [search_products, get_categories]
    llm_with_tools = llm.bind_tools(tools)

    # Define Nodes
    def agent_node(state: AgentState):
        messages = state['messages']
        response = llm_with_tools.invoke(messages)
        return {"messages": [response]}

    def should_continue(state: AgentState) -> Literal["tools", "__end__"]:
        messages = state['messages']
        last_message = messages[-1]
        if last_message.tool_calls:
            return "tools"
        return "__end__"

    # Define Graph
    workflow = StateGraph(AgentState)
    
    workflow.add_node("agent", agent_node)
    workflow.add_node("tools", ToolNode(tools))
    
    workflow.set_entry_point("agent")
    
    workflow.add_conditional_edges(
        "agent",
        should_continue,
    )
    
    workflow.add_edge("tools", "agent")

    return workflow.compile()

# --- Execution ---

async def run_agent(message: str, history: list = []):
    """
    Run the agent with a message.
    """
    app = create_agent_graph()
    
    # Convert simple history to LangChain messages if needed
    # (Simplified for this file)
    
    inputs = {"messages": [HumanMessage(content=message)]}
    
    final_state = await app.ainvoke(inputs)
    return final_state["messages"][-1].content
