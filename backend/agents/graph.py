from typing import Literal
from langchain_openai import ChatOpenAI
from langgraph.graph import StateGraph
from langgraph.prebuilt import ToolNode
from backend.agents.state import AgentState
from backend.agents.tools import search_products, get_categories, get_product_details, compare_products

def create_agent_graph():
    """
    Constructs the LangGraph agent workflow.
    """
    # Initialize LLM
    # In a real scenario, use a powerful model like gpt-4-turbo for agentic reasoning
    llm = ChatOpenAI(model="gpt-4-turbo", temperature=0)
    
    # Bind tools to LLM
    tools = [search_products, get_categories, get_product_details, compare_products]
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
