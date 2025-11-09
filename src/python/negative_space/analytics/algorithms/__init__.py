"""
Algorithms for advanced analytics computations.

Includes statistical analysis, correlation detection, trend analysis,
outlier detection, and anomaly detection algorithms.
"""

from .statistical import (
    StatisticalAnalyzer,
    CorrelationAnalyzer,
    CorrelationResult,
    TrendResult,
)

__all__ = [
    "StatisticalAnalyzer",
    "CorrelationAnalyzer",
    "CorrelationResult",
    "TrendResult",
]
