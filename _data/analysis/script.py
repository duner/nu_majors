# from scipy import stats
import numpy
print numpy.__version__


x = np.random.random(10)
y = np.random.random(10)
print x, y
slope, intercept, r_value, p_value, std_err = stats.linregress(x,y)
print slope