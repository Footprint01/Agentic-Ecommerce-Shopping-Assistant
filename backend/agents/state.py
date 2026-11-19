from typing import TypedDict, Annotated, Sequence, List
import operator
from langchain_core.messages import BaseMessage

class AgentState(TypedDict):
    messages: Annotated[Sequence[BaseMessage], operator.add]
    # We can add more state fields here if needed, like 'current_search_results'
    current_products: List[dict]
